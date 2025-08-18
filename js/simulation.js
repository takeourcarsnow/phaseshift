import { Settings } from './config.js';
import { State } from './state.js';
import { DEG, TAU, clamp, frac, lerp } from './utils.js';
import { turbulenceOffset } from './turbulence.js';

const fixedDt = 1/60;

export function effectiveMinGap() {
  const V = Settings.visual;
  const base = Settings.wave.minGap;
  if (!Settings.wave.autoMinGap) return base;
  const glowWidth = V.glowEnabled ? V.glow * 0.22 : 0;
  return base + V.lineWidth * 1.1 + glowWidth;
}

export function simulate(dt) {
  State.accumulator += dt;
  while (State.accumulator >= fixedDt) {
    step(fixedDt);
    State.accumulator -= fixedDt;
    State.time += fixedDt;
  }
}

function step(dt) {
  const Wv = Settings.wave, Ph = Settings.physics, Tb = Settings.turbulence, It = Settings.interaction;

  State.pointer.sx = lerp(State.pointer.sx, State.pointer.x, 0.35);
  State.pointer.sy = lerp(State.pointer.sy, State.pointer.y, 0.35);

  for (let i=0; i<State.layers.length; i++) State.layers[i].updateBaseline(State.desiredWaveCount, i);

  // Precompute turbulence x
  const s = Tb.scale;
  for (let i=0; i<State.sampleCount; i++) State.preXScaled[i] = State.xCoords[i] * s;

  // Flow direction and angle
  const dir = (Wv.direction === 'left') ? -1 : 1;
  const timePhase = dir * State.time * Wv.speed;
  const ang = Wv.flowAngleDeg * DEG;
  const cosA = Math.cos(ang), sinA = Math.sin(ang);
  const freq = Math.max(0.0001, Wv.frequency);
  const duty = clamp(Wv.pulseDuty, 0.05, 0.95);

  for (let L=0; L<State.layers.length; L++) {
    const layer = State.layers[L];
    const yArr = layer.points, vArr = layer.vel;
    const base = layer.baseY;
    const baseNorm = base / State.H;
    const uLayer = baseNorm * sinA; // constant per layer
    const amp = Wv.amplitude;
    const nb = Ph.neighbor, k = Ph.spring, c = Ph.damping;

    for (let i=0; i<State.sampleCount; i++) {
      const x = State.xCoords[i];
      const u = State.xNorms[i] * cosA + uLayer;        // oriented coordinate
      const p = frac(freq * u + timePhase);             // 0..1 phase
      const sinv = Math.sin(TAU * p);

      // Shape
      let shapeVal = 0;
      switch (Wv.shape) {
        case 'sine': shapeVal = sinv; break;
        case 'triangle': {
          shapeVal = 2 * Math.abs(2 * (p - Math.floor(p + 0.5))) - 1;
          break;
        }
        case 'square': {
          const xx = sinv * 6.0;
          shapeVal = xx * (27 + xx*xx) / (27 + 9*xx*xx);
          break;
        }
        case 'saw': {
          shapeVal = 2 * (p - Math.floor(p + 0.5));
          break;
        }
        case 'pulse': {
          let v = (p < duty) ? 1 : -1;
          const blend = sinv * 0.5 + 0.5;
          v = lerp(v, sinv, 0.15) * (0.8 + 0.2 * blend);
          shapeVal = v;
          break;
        }
        default: shapeVal = sinv;
      }

      const targetY = base + shapeVal * amp;

      const turb = turbulenceOffset(Tb.type, State.preXScaled[i], yArr[i], State.time);

      let inter = 0;
      if (It.mode !== 'off') {
        const dx = x - State.pointer.sx;
        const dy = yArr[i] - State.pointer.sy;
        const dist = Math.hypot(dx, dy);
        const r = It.radius;
        if (dist < r) {
          const fall = 1 - (dist / r);
          const sI = It.strength * (State.pointer.down ? 1.0 : 0.7);
          if (It.mode === 'push') inter += (dy / (dist + 1e-3)) * sI * fall * 160;
          else if (It.mode === 'pull') inter -= (dy / (dist + 1e-3)) * sI * fall * 160;
          else if (It.mode === 'gravity') inter -= Math.sign(dy) * sI * fall * 80;
          else if (It.mode === 'swirl') inter += (dx / (dist + 1e-3)) * sI * fall * 180;
        }
      }

      const y = yArr[i], v = vArr[i];
      const left = i>0 ? yArr[i-1] : yArr[i];
      const right = i<State.sampleCount-1 ? yArr[i+1] : yArr[i];
      const lap = left - 2*y + right;

      const a = ((targetY + turb + inter) - y) * k + lap * nb - v * c;

      const nv = v + a * dt;
      let ny = y + nv * dt;

      if (Ph.keepInside) {
        const m = 6;
        if (ny < m) { ny = m; vArr[i] *= 0.5; }
        else if (ny > State.H - m) { ny = State.H - m; vArr[i] *= 0.5; }
      }

      vArr[i] = nv;
      yArr[i] = ny;
    }
  }

  // Separation between layers
  if (State.layers.length > 1) {
    const gap = effectiveMinGap();
    const sepK = Ph.sepK;
    let maxViol, pass = 0;
    const maxPass = 6;
    do {
      maxViol = 0;
      for (let dir = 0; dir < 2; dir++) {
        for (let i=0; i<State.sampleCount; i++) {
          for (let L=0; L<State.layers.length-1; L++) {
            const A = State.layers[L], B = State.layers[L+1];
            const diff = (B.points[i] - A.points[i]) - gap;
            if (diff < 0) {
              const push = -diff * 0.5;
              A.points[i] -= push; B.points[i] += push;
              A.vel[i] -= push * sepK; B.vel[i] += push * sepK;
              if (-diff > maxViol) maxViol = -diff;
            }
          }
        }
      }
      pass++;
    } while (maxViol > 0.5 && pass < maxPass);
  }
}
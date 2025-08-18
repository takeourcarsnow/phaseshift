import { Settings } from './config.js';
import { State } from './state.js';
import { DEG, clamp, hsl, lerp } from './utils.js';

export function draw() {
  const ctx = State.ctx;
  const V = Settings.visual;

  ctx.globalCompositeOperation = 'source-over';
  const plexAlpha = V.plexEnabled ? clamp(V.plex, 0, 1) : 1;
  ctx.globalAlpha = plexAlpha;
  ctx.fillStyle = V.bgColor;
  ctx.fillRect(0, 0, State.W, State.H);
  ctx.globalAlpha = 1;

  ctx.globalCompositeOperation = V.blendMode || 'source-over';
  ctx.lineJoin = 'round';
  ctx.lineCap = (V.lineStyle === 'dotted') ? 'round' : 'round';
  ctx.shadowBlur = V.glowEnabled ? V.glow : 0;
  ctx.shadowColor = V.glowColor;

  const tilt = Math.tan((Settings.wave.tiltDeg || 0) * DEG);
  const xMid = State.W * 0.5;

  for (let L=0; L<State.layers.length; L++) {
    const layer = State.layers[L];
    if (layer.alpha <= 0.001) continue;

    ctx.lineWidth = V.lineWidth;
    if (V.lineStyle === 'solid') ctx.setLineDash([]);
    else if (V.lineStyle === 'dashed') ctx.setLineDash([12, 8]);
    else if (V.lineStyle === 'dotted') ctx.setLineDash([1, 18]);

    let strokeStyle = V.lineColor;
    if (V.colorMode === 'rainbow') {
      const hue = (Settings.internal.rainbowShift + (L * (360 / Math.max(1, State.desiredWaveCount)))) % 360;
      strokeStyle = hsl(hue, 90, 60);
    } else if (V.colorMode === 'velocity') {
      let sum = 0; const v = State.layers[L].vel;
      for (let i=0; i<State.sampleCount; i++) sum += Math.abs(v[i]);
      const avgV = sum / State.sampleCount;
      const vNorm = clamp(avgV / 600, 0, 1);
      const hue = lerp(Settings.internal.velocityHueMin, Settings.internal.velocityHueMax, vNorm);
      strokeStyle = hsl(hue, 90, lerp(45, 70, 1 - vNorm));
    }

    ctx.globalAlpha = layer.alpha;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    const yArr = layer.points;
    ctx.moveTo(State.xCoords[0], yArr[0] + tilt * (State.xCoords[0] - xMid));
    for (let i=1; i<State.sampleCount; i++) {
      const x = State.xCoords[i];
      ctx.lineTo(x, yArr[i] + tilt * (x - xMid));
    }
    ctx.stroke();
  }
}
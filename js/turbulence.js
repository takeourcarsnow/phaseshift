import { Settings } from './config.js';
import { State } from './state.js';
import { TAU } from './utils.js';

export function turbulenceOffset(type, xScaled, y, t) {
  const T = Settings.turbulence;
  if (type === 'none' || T.intensity === 0) return 0;
  switch (type) {
    case 'sine': {
      const s = T.scale, sp = T.speed;
      const v = Math.sin((xScaled/s)*TAU + t*sp*TAU) * 0.5
              + Math.sin((y*s)*TAU - t*sp*1.7*TAU) * 0.5;
      return v * T.intensity * 100;
    }
    case 'noise': {
      const s = T.scale, sp = T.speed;
      const v = Math.sin(State.perlin.noise2D(xScaled + t*sp, y*s - t*sp) * Math.PI);
      return v * T.intensity * 120;
    }
    case 'perlin': {
      const s = T.scale, sp = T.speed;
      const v = State.perlin.fbm2(xScaled + t*sp, y*s - t*sp, T.octaves, 2, 0.5);
      return v * T.intensity * 140;
    }
    case 'vortex': {
      const cx = State.pointer.down ? State.pointer.sx : State.W * 0.5;
      const cy = State.pointer.down ? State.pointer.sy : State.H * 0.5;
      const dx = (xScaled / (Settings.turbulence.scale || 1)) - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy) + 1e-3;
      const inv = Math.exp(-r / (Settings.interaction.radius*1.2 + 1));
      const vy = (dx / r) * inv;
      return vy * T.intensity * 240;
    }
    case 'chaos': {
      const s = T.scale, sp = T.speed;
      const a = State.perlin.fbm2(xScaled*0.6 + t*sp*1.3, y*s*0.7 - t*sp*0.9, 4, 2.2, 0.55);
      const b = State.perlin.noise2D(xScaled*1.9 - t*sp*0.7, y*s*1.7 + t*sp*1.1);
      return (a*0.7 + b*0.3) * T.intensity * 180;
    }
    default: return 0;
  }
}
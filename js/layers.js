import { Settings } from './config.js';
import { State } from './state.js';
import { clamp, lerp } from './utils.js';

export function computeLayerBaseline(total, idx) {
  const H = State.H;
  if (total <= 0) return H * clamp(Settings.wave.bandCenter, 0.02, 0.98);
  const c = clamp(Settings.wave.bandCenter, 0.02, 0.98);
  const s = clamp(Settings.wave.spread, 0.25, 1.5);
  const t = (idx + 1) / (total + 1);
  const t2 = clamp(c + (t - c) * s, 0.02, 0.98);
  return H * t2;
}

export class Layer {
  constructor(idx) {
    this.idx = idx;
    this.alpha = 1; this.targetAlpha = 1;
    this.baseY = 0; this.targetBaseY = 0;
    this.points = new Float32Array(State.sampleCount);
    this.vel = new Float32Array(State.sampleCount);
    const y0 = computeLayerBaseline(Math.max(1, State.desiredWaveCount), idx);
    this.baseY = y0; this.targetBaseY = y0;
    for (let i=0; i<State.sampleCount; i++) { this.points[i] = y0; this.vel[i] = 0; }
    this.alive = true;
  }
  resample() {
    const oldY = this.points, oldV = this.vel;
    const lenOld = oldY.length;
    const newY = new Float32Array(State.sampleCount);
    const newV = new Float32Array(State.sampleCount);
    for (let i=0; i<State.sampleCount; i++) {
      const t = (i * (lenOld - 1)) / (State.sampleCount - 1);
      const i0 = t|0, i1 = Math.min(lenOld - 1, i0 + 1), f = t - i0;
      newY[i] = (oldY[i0] || this.baseY) * (1 - f) + (oldY[i1] || this.baseY) * f;
      newV[i] = (oldV[i0] || 0) * (1 - f) + (oldV[i1] || 0) * f;
    }
    this.points = newY; this.vel = newV;
  }
  updateBaseline(total, i) {
    this.idx = i;
    this.targetBaseY = computeLayerBaseline(total, i);
    this.baseY = lerp(this.baseY, this.targetBaseY, 0.08);
    this.alpha = lerp(this.alpha, this.targetAlpha, 0.08);
    if (this.targetAlpha === 0 && Math.abs(this.alpha) < 0.01) this.alive = false;
  }
}

export function ensureLayerCount() {
  const layers = State.layers;
  const desired = State.desiredWaveCount;
  for (let i = desired; i < layers.length; i++) layers[i].targetAlpha = 0;
  while (layers.filter(l => l.alive).length < desired) layers.push(new Layer(layers.length));
  State.layers = layers.filter(l => l.alive);
  for (let i=0; i<State.layers.length; i++) State.layers[i].updateBaseline(desired, i);
}
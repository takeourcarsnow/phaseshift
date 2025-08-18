import { State } from './state.js';
import { byId, clamp } from './utils.js';

export function computeSamples() {
  const W = State.W;
  const stride = State.stride;
  State.sampleCount = Math.max(32, Math.floor(W / stride) + 1);
  State.xCoords = new Float32Array(State.sampleCount);
  State.xNorms = new Float32Array(State.sampleCount);
  const step = W / (State.sampleCount - 1);
  for (let i=0; i<State.sampleCount; i++) { State.xCoords[i] = i * step; State.xNorms[i] = State.xCoords[i] / W; }
  State.preXScaled = new Float32Array(State.sampleCount);
  State.layers.forEach(l => l.resample());
  const chip = byId('detailChip'); if (chip) chip.textContent = `Detail: ${State.stride}px`;
  const lbl = byId('v_detail'); if (lbl) lbl.textContent = `${State.stride}`;
}

export function setStride(px) {
  State.stride = clamp(Math.round(px), 3, 16);
  computeSamples();
}
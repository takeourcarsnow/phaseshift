import { Settings } from './config.js';

export const State = {
  canvas: null,
  ctx: null,
  dpr: 1,
  W: 0,
  H: 0,

  stride: Settings.system.detail,
  sampleCount: 0,
  xCoords: new Float32Array(0),
  xNorms: new Float32Array(0),
  preXScaled: new Float32Array(0),

  layers: [],
  desiredWaveCount: Settings.wave.count,

  pointer: { x:0, y:0, sx:0, sy:0, down:false },

  perlin: null, // set in main

  // timing
  accumulator: 0,
  time: 0,
  last: performance.now(),
  fpsEMA: 60,
  lastFpsUpdate: 0,

  ro: null
};
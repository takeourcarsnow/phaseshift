import { Settings } from './config.js';
import { State } from './state.js';
import { computeSamples, setStride } from './samples.js';
import { ensureLayerCount, Layer } from './layers.js';
import { simulate } from './simulation.js';
import { applyContextLimits, updateContextChip } from './context.js';
import { initUI, syncControls } from './ui.js';
import { initInput } from './input.js';
import { draw } from './draw.js';
import { createPerlin } from './noise.js';
import { byId } from './utils.js';

function bindCanvas() {
  State.canvas = document.getElementById('c');
  State.ctx = State.canvas.getContext('2d');
}

function resize() {
  State.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const rect = State.canvas.getBoundingClientRect();
  State.W = Math.floor(rect.width);
  State.H = Math.floor(rect.height);
  State.canvas.width = Math.floor(State.W * State.dpr);
  State.canvas.height = Math.floor(State.H * State.dpr);
  State.ctx.setTransform(State.dpr, 0, 0, State.dpr, 0, 0);
  computeSamples();
  applyContextLimits();
}
window.addEventListener('resize', resize);

function loop(now) {
  if (!Settings.system.paused) {
    const dt = Math.min(0.05, (now - State.last) / 1000);
    simulate(dt);
    draw();
    Settings.internal.rainbowShift = (Settings.internal.rainbowShift + 0.2) % 360;
  }
  const dtms = now - State.last;
  if (dtms > 0) State.fpsEMA = State.fpsEMA*0.9 + (1000 / dtms)*0.1;
  State.last = now;

  if (Settings.system.autoDetail) {
    const target = Settings.system.targetFPS;
    if (State.fpsEMA < target - 5 && State.stride < 16) setStride(State.stride + 1);
    else if (State.fpsEMA > target + 8 && State.stride > 4) setStride(State.stride - 1);
  }

  // Throttled chip updates
  if (!State.lastFpsUpdate || now - State.lastFpsUpdate > 250) {
    const fpsChip = byId('fpsChip'); if (fpsChip) fpsChip.textContent = `FPS: ${Math.round(State.fpsEMA)}`;
    State.lastFpsUpdate = now;
  }
  updateContextChip(now);

  requestAnimationFrame(loop);
}

function boot() {
  bindCanvas();
  resize();
  // Initial layers
  for (let i=0; i<Settings.wave.count; i++) State.layers.push(new Layer(i));
  State.desiredWaveCount = Settings.wave.count;
  ensureLayerCount();
  // Perlin
  State.perlin = createPerlin(Settings.turbulence.seed);
  // UI + input
  initUI();
  initInput();
  // Resize observer to react to layout changes (panel collapsed etc.)
  State.ro = new ResizeObserver(() => resize());
  State.ro.observe(State.canvas);
  State.last = performance.now();
  applyContextLimits();
  syncControls();
  requestAnimationFrame(loop);
}

boot();
import { Settings } from './config.js';
import { State } from './state.js';
import { byId, clamp } from './utils.js';
import { computeLayerBaseline } from './layers.js';
import { effectiveMinGap } from './simulation.js';

let lastCtxUpdate = 0;

export function spacingBetweenBaselines() {
  if (State.desiredWaveCount <= 1) return State.H;
  const i = Math.max(0, Math.floor(State.desiredWaveCount/2) - 1);
  const y1 = computeLayerBaseline(State.desiredWaveCount, i);
  const y2 = computeLayerBaseline(State.desiredWaveCount, i + 1);
  return Math.abs(y2 - y1);
}

export function applyContextLimits() {
  const spacing = spacingBetweenBaselines();
  const safeAmplitude = Math.max(0, Math.floor((spacing - effectiveMinGap()) * 0.5));
  Settings.internal.amplitudeCap = safeAmplitude;

  // Adapt amplitude slider max and auto limit
  const ampEl = byId('amplitude');
  if (ampEl) ampEl.max = Math.max(10, Math.round(safeAmplitude * 2));
  const hint = byId('ampHint');
  if (hint) hint.textContent = `Safe amplitude ≤ ${safeAmplitude}px (spacing ≈ ${Math.round(spacing)}px, min-gap ≈ ${Math.round(effectiveMinGap())}px)`;

  if (Settings.wave.autoAmplitude) {
    const clamped = clamp(Settings.wave.amplitude, 0, safeAmplitude);
    if (clamped !== Settings.wave.amplitude) {
      Settings.wave.amplitude = clamped;
      if (ampEl) ampEl.value = clamped;
      const lbl = byId('v_amplitude'); if (lbl) lbl.textContent = clamped.toFixed(0);
    }
  }

  // Adapt interaction radius max and auto
  const maxR = Math.round(Math.hypot(State.W, State.H) * 0.6);
  const rEl = byId('interRadius');
  if (rEl) rEl.max = String(maxR);
  if (Settings.interaction.autoRadius) {
    const ideal = Math.round(Math.min(maxR, Math.min(State.W, State.H) * 0.35));
    if (ideal !== Settings.interaction.radius) {
      Settings.interaction.radius = ideal;
      if (rEl) rEl.value = ideal;
      const lblR = byId('v_interRadius'); if (lblR) lblR.textContent = ideal.toFixed(0);
    }
  }

  updateContextChip();
}

export function updateContextChip(now = performance.now()) {
  const chip = byId('ctxChip'); if (!chip) return;
  if (now - lastCtxUpdate < 250) return;
  lastCtxUpdate = now;

  const amp = Settings.wave.amplitude;
  const cap = Settings.internal.amplitudeCap || 0;
  const target = Settings.system.targetFPS;
  const lowFPS = State.fpsEMA < target - 10;

  let msg = 'OK';
  chip.classList.remove('warn');
  if (amp > cap + 2) { msg = 'Overlap risk'; chip.classList.add('warn'); }
  if (lowFPS) { msg = 'Perf: auto-detail'; chip.classList.add('warn'); }
  chip.textContent = msg;
}
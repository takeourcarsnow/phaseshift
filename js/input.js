import { State } from './state.js';

function setPointer(e) {
  const r = State.canvas.getBoundingClientRect();
  State.pointer.x = (e.clientX - r.left);
  State.pointer.y = (e.clientY - r.top);
}

export function initInput() {
  window.addEventListener('pointermove', (e) => setPointer(e), { passive: true });
  window.addEventListener('pointerdown', (e) => { State.pointer.down = true; setPointer(e); });
  window.addEventListener('pointerup', () => { State.pointer.down = false; });
}
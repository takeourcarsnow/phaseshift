# Wave Playground

Wave Playground is an interactive, context-aware web application for visualizing and experimenting with animated waveforms. It features a highly customizable UI, real-time simulation, and a variety of visual and physical parameters for creative exploration.

## Features

- **Dynamic Wave Simulation:**
  - Multiple wave layers with adjustable count, amplitude, frequency, speed, and shape (sine, triangle, square, sawtooth, pulse).
  - Real-time physics and turbulence (Perlin, chaos, sine, etc.).
  - Interactive controls for direction, flow angle, tilt, and more.
- **Rich Visual Customization:**
  - Color modes: rainbow, velocity, custom.
  - Adjustable line width, style (solid, dashed, dotted), glow, and blend modes.
  - Background and line color selection.
- **User Interaction:**
  - Mouse/touch interaction modes: push, pull, swirl, gravity, off.
  - Responsive UI with context-aware sliders and hints.
  - Preset system for saving/loading favorite configurations.
- **Performance:**
  - Adaptive detail for smooth performance (auto-detail based on FPS).
  - Optimized for both desktop and mobile browsers.

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/takeourcarsnow/phaseshift.git
   cd phaseshift
   ```
2. **Open `index.html` in your browser.**
   - No build step or server required; all code is client-side JavaScript.

## File Structure

- `index.html` — Main HTML entry point
- `styles.css` — App styling
- `js/` — JavaScript modules:
  - `main.js` — App entry point and main loop
  - `config.js` — Default settings
  - `state.js` — App state
  - `draw.js` — Canvas drawing logic
  - `simulation.js` — Physics and wave simulation
  - `context.js` — Context-aware UI logic
  - `ui.js` — UI controls and event binding
  - `presets.js` — Preset management
  - `input.js`, `layers.js`, `noise.js`, `randomize.js`, `samples.js`, `turbulence.js`, `utils.js` — Supporting modules

## Usage

- Use the sidebar to adjust wave, flow, turbulence, interaction, and visual parameters.
- Save and load presets for quick access to favorite settings.
- Interact with the canvas using mouse or touch for real-time effects.
- Toggle fullscreen and pause/resume simulation as needed.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

Created by [takeourcarsnow](https://github.com/takeourcarsnow).

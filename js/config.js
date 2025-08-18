const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const Settings = {
  wave: {
    count: 5,
    amplitude: 120,
    frequency: 1.6,
    speed: 0.6,
    minGap: 28,
    autoMinGap: true,
    shape: 'sine',
    pulseDuty: 0.25,
    autoAmplitude: false,
    spread: 1.0,
    bandCenter: 0.5,
    direction: 'right',
    flowAngleDeg: 0,
    tiltDeg: 0
  },
  turbulence: { type: 'perlin', intensity: 0.35, scale: 0.0022, speed: 0.22, octaves: 3, seed: ((Math.random()*1e9)|0) },
  interaction: { mode: 'push', strength: 1.2, radius: 160, autoRadius: true },
  physics: { spring: 80, neighbor: 420, damping: 10.5, sepK: 0.6, keepInside: false },
  visual: {
    lineWidth: 2.2, lineStyle: 'solid',
    colorMode: 'rainbow', lineColor: '#00d1ff', bgColor: '#0b0c10',
    glowEnabled: false, glow: 18, glowColor: '#ffffff',
    blendMode: 'source-over',
    plexEnabled: false, plex: 0.1
  },
  system: {
    detail: 8, autoDetail: false, targetFPS: 60, paused: false,
    reduceMotion
  },
  internal: { rainbowShift: 0, velocityHueMin: 200, velocityHueMax: 360, amplitudeCap: 999 }
};
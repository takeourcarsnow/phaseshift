import { Settings } from './config.js';

export function randomizeSettings() {
  const pick = arr => arr[(Math.random()*arr.length)|0];
  Settings.wave.count = (Math.random()*8+2)|0;
  Settings.wave.amplitude = (Math.random()*160+40)|0;
  Settings.wave.frequency = Math.random()*2.8+0.6;
  Settings.wave.speed = Math.random()*1.3+0.1;
  Settings.wave.minGap = (Math.random()*48+10)|0;
  Settings.wave.shape = pick(['sine','triangle','square','saw','pulse']);
  Settings.wave.pulseDuty = Math.random()*0.7+0.15;
  Settings.wave.autoMinGap = true;

  Settings.wave.spread = Math.random()*0.7 + 0.6;
  Settings.wave.bandCenter = Math.random()*0.4 + 0.3;
  Settings.wave.direction = pick(['left','right']);
  Settings.wave.flowAngleDeg = Math.round((Math.random()*80 - 40));
  Settings.wave.tiltDeg = Math.round((Math.random()*40 - 20)*2)/2;

  Settings.turbulence.type = pick(['none','sine','noise','perlin','vortex','chaos']);
  Settings.turbulence.intensity = Math.random()*1.1;
  Settings.turbulence.scale = Math.random()*0.0035+0.0005;
  Settings.turbulence.speed = Math.random()*0.9;

  Settings.interaction.mode = pick(['off','push','pull','gravity','swirl']);
  Settings.interaction.strength = Math.random()*1.5+0.3;
  Settings.interaction.radius = Math.random()*200+80;

  Settings.physics.spring = Math.random()*80+40;
  Settings.physics.neighbor = Math.random()*700+200;
  Settings.physics.damping = Math.random()*10+6;
  Settings.physics.sepK = Math.random()*0.9+0.3;
  Settings.physics.keepInside = Math.random() < 0.5;

  Settings.visual.lineWidth = Math.random()*3.5+1;
  Settings.visual.lineStyle = pick(['solid','dashed','dotted']);
  Settings.visual.colorMode = pick(['custom','rainbow','velocity']);
  Settings.visual.lineColor = '#'+((Math.random()*0xffffff)|0).toString(16).padStart(6,'0');
  Settings.visual.bgColor = '#'+((Math.random()*0x202020)|0 + 0x0b0c10).toString(16).slice(0,6).padStart(6,'0');
  Settings.visual.glowEnabled = Math.random() < 0.35 ? true : false;
  Settings.visual.glow = (Math.random()*22+6)|0;
  Settings.visual.glowColor = '#ffffff';
  Settings.visual.blendMode = pick(['source-over','lighter','screen','overlay','soft-light','difference']);
  Settings.visual.plexEnabled = Math.random() < 0.3 ? true : false;
  Settings.visual.plex = Math.random()*0.15+0.05;
}
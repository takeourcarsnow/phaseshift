const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Settings with default values
const settings = {
    gridSize: 3,
    lineStrength: 1,
    lineWidth: 3,
    lineColor: '#f0f0f0',
    mouseRadius: 100,
    elasticity: 0.3,
    friction: 0.20,
    minFriction: 0.05,
    colorMode: 'rainbow',
    interactionMode: 'push',
    backgroundColor: '#1a1a1a',
    lineStyle: 'solid',
    waveCount: 5,
    waveShape: 'sine',
    interactionStrength: 0.5,
    waveSpeed: 1,
    waveAmplitude: 51,
    waveSpacing: 50,
    turbulence: 0,
    turbulenceType: 'sine',
    turbulenceIntensity: 1,
    turbulenceOctaves: 3,
    turbulenceChaos: 0.5,
    turbulenceVortex: 0,
    turbulenceDirection: 0,
    turbulenceSpeed: 1,
    turbulenceScale: 50,
    turbulenceComplexity: 1,
    damping: 0.1,
    maxForce: 50,
    neighborInfluence: 0.2,
    positionSpring: 0.2,
    velocityDamping: 0.1,
    maxAcceleration: 9,
    waveRotation: 0,
    globalThickness: 5,
    blendMode: 'source-over',
    plexEffect: false,
    plexIntensity: 50,
    plexTrailDuration: 1.0,
    glowEffect: false,
    glowIntensity: 30,
};

let mouse = { x: -1000, y: -1000, smoothX: -1000, smoothY: -1000, vx: 0, vy: 0 };

// Get control elements
const gridSizeInput = document.getElementById('gridSize');
const lineStrengthInput = document.getElementById('lineStrength');
const lineWidthInput = document.getElementById('lineWidth');
const lineColorInput = document.getElementById('lineColor');
const mouseRadiusInput = document.getElementById('mouseRadius');
const elasticityInput = document.getElementById('elasticity');
const frictionInput = document.getElementById('friction');
const backgroundColorInput = document.getElementById('backgroundColor');
const backgroundImageInput = document.getElementById('backgroundImage');
const uploadButton = document.getElementById('uploadButton');
const lineStyleInputs = document.querySelectorAll('input[name="lineStyle"]');
const waveCountInput = document.getElementById('waveCount');
const interactionStrengthInput = document.getElementById('interactionStrength');
const controlsContainer = document.getElementById('controls-container');
const controls = document.getElementById('controls');
const controlsToggle = document.getElementById('controls-toggle');
const waveSpeedInput = document.getElementById('waveSpeed');
const waveAmplitudeInput = document.getElementById('waveAmplitude');
const waveSpacingInput = document.getElementById('waveSpacing');

// Radio buttons
const colorModeInputs = document.querySelectorAll('input[name="colorMode"]');
const interactionModeInputs = document.querySelectorAll('input[name="interactionMode"]');
const waveShapeInputs = document.querySelectorAll('input[name="waveShape"]');
const displayModeInputs = document.querySelectorAll('input[name="displayMode"]');

// Add event listener for blend mode
const blendModeSelect = document.getElementById('blendMode');
if (blendModeSelect) {
    blendModeSelect.addEventListener('change', (e) => {
        settings.blendMode = e.target.value;
        // Force redraw
        const time = performance.now() / 1000;
        updateWaves(mouse, time);
        drawWaves(time);
    });
}

// Add this at the top of the file, after the canvas setup
const initialSettings = {
    gridSize: 3,
    lineStrength: 1,
    lineWidth: 3,
    lineColor: '#f0f0f0',
    mouseRadius: 100,
    elasticity: 0.3,
    friction: 0.20,
    minFriction: 0.05,
    colorMode: 'rainbow',
    interactionMode: 'push',
    backgroundColor: '#1a1a1a',
    lineStyle: 'solid',
    waveCount: 5,
    waveShape: 'sine',
    interactionStrength: 0.5,
    waveSpeed: 1,
    waveAmplitude: 51,
    waveSpacing: 50,
    turbulence: 0,
    turbulenceType: 'sine',
    turbulenceIntensity: 1,
    turbulenceOctaves: 3,
    turbulenceChaos: 0.5,
    turbulenceVortex: 0,
    turbulenceDirection: 0,
    turbulenceSpeed: 1,
    turbulenceScale: 50,
    turbulenceComplexity: 1,
    damping: 0.1,
    maxForce: 50,
    neighborInfluence: 0.2,
    positionSpring: 0.2,
    velocityDamping: 0.1,
    maxAcceleration: 9,
    waveRotation: 0,
    globalThickness: 5,
    blendMode: 'source-over',
    plexEffect: false,
    plexIntensity: 50,
    plexTrailDuration: 1.0,
    glowEffect: false,
    glowIntensity: 30,
};

// Update the default button event listener
document.getElementById('defaultButton').addEventListener('click', () => {
    // Reset all settings to initial values
    Object.assign(settings, JSON.parse(JSON.stringify(initialSettings)));
    
    // Force update critical settings
    settings.waveCount = initialSettings.waveCount;
    settings.waveSpacing = initialSettings.waveSpacing;
    
    // Update UI elements directly
    document.getElementById('waveCount').value = settings.waveCount;
    document.getElementById('waveCountValue').textContent = settings.waveCount;
    document.getElementById('waveSpacing').value = settings.waveSpacing;
    document.getElementById('waveSpacingValue').textContent = settings.waveSpacing;
    
    // Update full UI
    updateUI();
    
    // Completely reset wave system
    waveLayers = [];
    createGrid();
    createWaves();
    stabilizeWaveSystem();
    
    // Immediate forced redraw
    const time = performance.now() / 1000;
    updateWaves(mouse, time);
    drawWaves(time);
});

// Update the wave count handler
document.getElementById('waveCount').addEventListener('input', function(e) {
    settings.waveCount = parseInt(e.target.value);
    document.getElementById('waveCountValue').textContent = settings.waveCount;
    
    // Redistribute waves smoothly
    redistributeWaves();
    stabilizeWaveSystem();
});

// Update the updateUI function to handle all settings
function updateUI() {
    // Update all input values and displays
    document.getElementById('gridSizeValue').textContent = settings.gridSize;
    document.getElementById('gridSize').value = settings.gridSize;
    
    document.getElementById('waveCountValue').textContent = settings.waveCount;
    document.getElementById('waveCount').value = settings.waveCount;
    
    document.getElementById('waveAmplitudeValue').textContent = settings.waveAmplitude;
    document.getElementById('waveAmplitude').value = settings.waveAmplitude;
    
    document.getElementById('lineWidthValue').textContent = settings.lineWidth;
    document.getElementById('lineWidth').value = settings.lineWidth;
    
    document.getElementById('elasticityValue').textContent = settings.elasticity.toFixed(2);
    document.getElementById('elasticity').value = settings.elasticity;
    
    document.getElementById('frictionValue').textContent = settings.friction.toFixed(2);
    document.getElementById('friction').value = settings.friction;
    
    document.getElementById('turbulenceValue').textContent = settings.turbulence.toFixed(1);
    document.getElementById('turbulence').value = settings.turbulence;
    
    document.getElementById('turbulenceSpeedValue').textContent = settings.turbulenceSpeed.toFixed(1);
    document.getElementById('turbulenceSpeed').value = settings.turbulenceSpeed;
    
    document.getElementById('turbulenceScaleValue').textContent = settings.turbulenceScale;
    document.getElementById('turbulenceScale').value = settings.turbulenceScale;
    
    document.getElementById('turbulenceComplexityValue').textContent = settings.turbulenceComplexity;
    document.getElementById('turbulenceComplexity').value = settings.turbulenceComplexity;
    
    document.getElementById('globalThicknessValue').textContent = settings.globalThickness;
    document.getElementById('globalThickness').value = settings.globalThickness;
    
    // Update radio buttons
    document.querySelector(`input[name="interactionMode"][value="${settings.interactionMode}"]`).checked = true;
    document.querySelector(`input[name="colorMode"][value="${settings.colorMode}"]`).checked = true;
    document.querySelector(`input[name="waveShape"][value="${settings.waveShape}"]`).checked = true;
    document.querySelector(`input[name="displayMode"][value="${settings.displayMode}"]`).checked = true;
    document.querySelector(`input[name="lineStyle"][value="${settings.lineStyle}"]`).checked = true;
    
    // Update blend mode
    if (blendModeSelect) {
        blendModeSelect.value = settings.blendMode;
    }
    
    // Update plex and glow effects
    document.getElementById('plexEffect').checked = settings.plexEffect;
    document.getElementById('plexIntensityValue').textContent = settings.plexIntensity;
    document.getElementById('plexIntensity').value = settings.plexIntensity;
    
    document.getElementById('glowEffect').checked = settings.glowEffect;
    document.getElementById('glowIntensityValue').textContent = settings.glowIntensity;
    document.getElementById('glowIntensity').value = settings.glowIntensity;
    
    document.getElementById('plexTrailDurationValue').textContent = settings.plexTrailDuration;
    document.getElementById('plexTrailDuration').value = settings.plexTrailDuration;
}

// Add this function to randomize all settings
function randomizeSettings() {
    // Keep grid resolution unchanged
    // settings.gridSize remains as is
    
    // Randomize line settings
    settings.lineStrength = Math.random() * 10;
    settings.lineWidth = Math.floor(Math.random() * 5) + 1;
    settings.lineColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    settings.mouseRadius = Math.floor(Math.random() * 290) + 10;
    
    // Randomize physics settings
    settings.elasticity = Math.random();
    settings.friction = Math.random();
    settings.positionSpring = Math.random() * 2;
    settings.velocityDamping = Math.random();
    settings.maxAcceleration = Math.floor(Math.random() * 10) + 1;
    
    // Randomize wave settings
    settings.waveCount = Math.floor(Math.random() * 50) + 1;
    settings.waveSpeed = parseFloat((Math.random() * 5).toFixed(1));
    settings.waveAmplitude = Math.floor(Math.random() * 300) + 1;
    settings.waveSpacing = Math.floor(Math.random() * 190) + 10;
    settings.waveRotation = Math.floor(Math.random() * 24) * 15;
    
    // Randomize wave shape
    const waveShapes = ['sine', 'square', 'triangle', 'sawtooth', 'pulse'];
    settings.waveShape = waveShapes[Math.floor(Math.random() * waveShapes.length)];
    
    // Randomize color mode
    const colorModes = ['custom', 'rainbow', 'velocity'];
    settings.colorMode = colorModes[Math.floor(Math.random() * colorModes.length)];
    
    // Randomize line style
    const lineStyles = ['solid', 'dashed', 'dotted'];
    settings.lineStyle = lineStyles[Math.floor(Math.random() * lineStyles.length)];
    
    // Randomize turbulence settings
    const turbulenceTypes = ['sine', 'noise', 'perlin', 'vortex', 'chaos', 'directional', 'random', 'sawtooth', 'pulse'];
    settings.turbulenceType = turbulenceTypes[Math.floor(Math.random() * turbulenceTypes.length)];
    settings.turbulence = parseFloat((Math.random() * 2).toFixed(1));
    settings.turbulenceSpeed = parseFloat((Math.random() * 3).toFixed(1));
    settings.turbulenceScale = Math.floor(Math.random() * 190) + 10;
    settings.turbulenceIntensity = parseFloat((Math.random() * 3).toFixed(1));
    settings.turbulenceDirection = Math.floor(Math.random() * 360);
    
    // Keep plex and glow effects unchanged
    // settings.plexEffect remains as is
    // settings.glowEffect remains as is
    
    // Only randomize their intensities
    settings.plexIntensity = Math.floor(Math.random() * 100);
    settings.glowIntensity = Math.floor(Math.random() * 100);
    settings.plexTrailDuration = parseFloat((Math.random() * 3).toFixed(1));
    
    // Update UI and redraw
    updateUI();
    createWaves();
}

// Add event listeners for the buttons
document.getElementById('randomButton').addEventListener('click', randomizeSettings);

document.getElementById('defaultButton').addEventListener('click', () => {
    // Reset all settings to initial values
    Object.assign(settings, JSON.parse(JSON.stringify(initialSettings)));
    
    // Force update critical settings
    settings.waveCount = initialSettings.waveCount;
    settings.waveSpacing = initialSettings.waveSpacing;
    
    // Update UI elements directly
    document.getElementById('waveCount').value = settings.waveCount;
    document.getElementById('waveCountValue').textContent = settings.waveCount;
    document.getElementById('waveSpacing').value = settings.waveSpacing;
    document.getElementById('waveSpacingValue').textContent = settings.waveSpacing;
    
    // Update full UI
    updateUI();
    
    // Completely reset wave system
    waveLayers = [];
    createGrid();
    createWaves();
    stabilizeWaveSystem();
    
    // Immediate forced redraw
    const time = performance.now() / 1000;
    updateWaves(mouse, time);
    drawWaves(time);
});

// Add this at the top of settings.js, after the canvas setup
window.stabilizeWaveSystem = function() {
    if (typeof waveLayers !== 'undefined') {
        waveLayers.forEach(wave => {
            wave.points.forEach(point => {
                point.targetAmplitude = settings.waveAmplitude;
                point.currentAmplitude = settings.waveAmplitude;
                point.vy *= 0.8; // Add damping when changing wave count
            });
        });
    }
}; 
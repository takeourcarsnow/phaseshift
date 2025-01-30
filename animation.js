// Update value displays
gridSizeInput.addEventListener('input', (e) => {
    const rawValue = parseFloat(e.target.value);
    // Logarithmic scaling: 1-200 range with slower changes at lower values
    const scaledValue = 1 + (200 - 1) * Math.pow((rawValue - 1) / (200 - 1), 2);
    document.getElementById('gridSizeValue').textContent = Math.round(scaledValue);
    settings.gridSize = Math.round(scaledValue);
    createGrid();
    createWaves();
});

waveCountInput.addEventListener('input', (e) => {
    document.getElementById('waveCountValue').textContent = e.target.value;
    settings.waveCount = parseInt(e.target.value);
    createWaves();
    settings.waveThickness = Array(settings.waveCount).fill(3); // Reset thickness array
    generateThicknessControls();
});

lineStrengthInput.addEventListener('input', (e) => {
    document.getElementById('lineStrengthValue').textContent = e.target.value;
    settings.lineStrength = parseFloat(e.target.value);
});

interactionStrengthInput.addEventListener('input', (e) => {
    document.getElementById('interactionStrengthValue').textContent = e.target.value;
    settings.interactionStrength = parseFloat(e.target.value);
});

lineWidthInput.addEventListener('input', (e) => {
    document.getElementById('lineWidthValue').textContent = e.target.value;
    settings.lineWidth = parseInt(e.target.value);
});

lineColorInput.addEventListener('input', (e) => {
    settings.lineColor = e.target.value;
});

mouseRadiusInput.addEventListener('input', (e) => {
    const rawValue = parseFloat(e.target.value);
    // Logarithmic scaling: 10-300 range
    const scaledValue = 10 + (300 - 10) * Math.pow((rawValue - 10) / (300 - 10), 2);
    document.getElementById('mouseRadiusValue').textContent = Math.round(scaledValue);
    settings.mouseRadius = Math.round(scaledValue);
});

elasticityInput.addEventListener('input', (e) => {
    document.getElementById('elasticityValue').textContent = e.target.value;
    settings.elasticity = parseFloat(e.target.value);
});

frictionInput.addEventListener('input', (e) => {
    const rawValue = parseFloat(e.target.value);
    settings.friction = Math.max(settings.minFriction, rawValue);
    document.getElementById('frictionValue').textContent = settings.friction.toFixed(2);
});

backgroundColorInput.addEventListener('input', (e) => {
    settings.backgroundColor = e.target.value;
});

uploadButton.addEventListener('click', () => {
    backgroundImageInput.click();
});

backgroundImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            settings.backgroundImage = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

lineStyleInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        settings.lineStyle = e.target.value;
    });
});

clearButton.addEventListener('click', () => {
    createGrid();
    createWaves();
});

// Radio button event listeners
colorModeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        settings.colorMode = e.target.value;
    });
});

interactionModeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        settings.interactionMode = e.target.value;
    });
});

waveShapeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        settings.waveShape = e.target.value;
    });
});

displayModeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        settings.displayMode = e.target.value;
    });
});

// Controls toggle
controlsToggle.addEventListener('click', () => {
    controls.classList.toggle('collapsed');
});

// New event listeners for wave speed, amplitude, and spacing
waveSpeedInput.addEventListener('input', (e) => {
    document.getElementById('waveSpeedValue').textContent = e.target.value;
    settings.waveSpeed = parseFloat(e.target.value);
});

waveAmplitudeInput.addEventListener('input', (e) => {
    const rawValue = parseFloat(e.target.value);
    document.getElementById('waveAmplitudeValue').textContent = rawValue;
    settings.waveAmplitude = rawValue;
});

waveSpacingInput.addEventListener('input', (e) => {
    const rawValue = parseFloat(e.target.value);
    // Linear scaling instead of logarithmic for more predictable results
    const scaledValue = 10 + (200 - 10) * (rawValue - 10) / (200 - 10);
    document.getElementById('waveSpacingValue').textContent = Math.round(scaledValue);
    settings.waveSpacing = Math.round(scaledValue);
    createWaves();
});

const turbulenceInput = document.getElementById('turbulence');

// Add to existing event listeners
turbulenceInput.addEventListener('input', (e) => {
    document.getElementById('turbulenceValue').textContent = e.target.value;
    settings.turbulence = parseFloat(e.target.value);
});

// Add these to existing input listeners
document.getElementById('turbulenceType').addEventListener('change', (e) => {
    settings.turbulenceType = e.target.value;
    updateTurbulenceVisibility();
});

document.getElementById('turbulenceSpeed').addEventListener('input', (e) => {
    document.getElementById('turbulenceSpeedValue').textContent = e.target.value;
    settings.turbulenceSpeed = parseFloat(e.target.value);
});

document.getElementById('turbulenceScale').addEventListener('input', (e) => {
    document.getElementById('turbulenceScaleValue').textContent = e.target.value;
    settings.turbulenceScale = parseFloat(e.target.value);
});

document.getElementById('turbulenceComplexity').addEventListener('input', (e) => {
    document.getElementById('turbulenceComplexityValue').textContent = e.target.value;
    settings.turbulenceComplexity = parseFloat(e.target.value);
});

const randomButton = document.getElementById('randomButton');
const defaultButton = document.getElementById('defaultButton');

randomButton.addEventListener('click', () => {
    settings.gridSize = Math.floor(Math.random() * 9) + 2; // Ensure gridSize is between 2 and 10
    settings.waveCount = Math.floor(Math.random() * 49) + 1;
    settings.waveAmplitude = Math.floor(Math.random() * 199) + 1;
    settings.lineWidth = Math.floor(Math.random() * 4) + 1;
    settings.elasticity = Math.random();
    settings.friction = Math.max(settings.minFriction, Math.random());
    settings.turbulence = Math.random() * 2;
    settings.turbulenceSpeed = Math.random() * 3;
    settings.turbulenceScale = Math.floor(Math.random() * 190) + 10;
    settings.turbulenceComplexity = Math.floor(Math.random() * 4) + 1;
    
    const interactionModes = ['push', 'pull', 'both', 'gravity', 'unified'];
    settings.interactionMode = interactionModes[Math.floor(Math.random() * interactionModes.length)];
    
    const colorModes = ['white', 'rainbow', 'velocity'];
    settings.colorMode = colorModes[Math.floor(Math.random() * colorModes.length)];
    
    const waveShapes = ['sine', 'square', 'triangle'];
    settings.waveShape = waveShapes[Math.floor(Math.random() * waveShapes.length)];
    
    // Ensure waves mode is always selected
    settings.displayMode = 'waves';
    
    const lineStyles = ['solid', 'dashed', 'dotted'];
    settings.lineStyle = lineStyles[Math.floor(Math.random() * lineStyles.length)];
    
    updateUI();
    createGrid();
    createWaves();
});

defaultButton.addEventListener('click', () => {
    settings.gridSize = 3;
    settings.waveCount = 5;
    settings.waveAmplitude = 51;
    settings.lineWidth = 3;
    settings.elasticity = 0.2;
    settings.friction = 0.05;
    settings.colorMode = 'rainbow';
    settings.interactionMode = 'push';
    settings.turbulence = 0;
    settings.turbulenceSpeed = 1;
    settings.turbulenceScale = 50;
    settings.turbulenceComplexity = 1;
    settings.waveShape = 'sine';
    settings.displayMode = 'waves';
    settings.lineStyle = 'solid';
    
    updateUI();
    createGrid();
    createWaves();
});

function updateUI() {
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
    
    document.querySelector(`input[name="interactionMode"][value="${settings.interactionMode}"]`).checked = true;
    document.querySelector(`input[name="colorMode"][value="${settings.colorMode}"]`).checked = true;
    document.querySelector(`input[name="waveShape"][value="${settings.waveShape}"]`).checked = true;
    document.querySelector(`input[name="displayMode"][value="${settings.displayMode}"]`).checked = true;
    document.querySelector(`input[name="lineStyle"][value="${settings.lineStyle}"]`).checked = true;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background color or image
    if (settings.backgroundImage) {
        const img = new Image();
        img.src = settings.backgroundImage;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Smoother mouse tracking
    const smoothFactor = 0.2; // Reduced from 0.3 for more smoothing
    mouse.vx = (mouse.x - mouse.smoothX) * smoothFactor;
    mouse.vy = (mouse.y - mouse.smoothY) * smoothFactor;
    mouse.smoothX += mouse.vx;
    mouse.smoothY += mouse.vy;

    const time = performance.now() / 1000;

    updateWaves(mouse, time);
    drawWaves(time);

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
    mouse.smoothX = -1000;
    mouse.smoothY = -1000;
});

// Touch support
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('touchcancel', handleTouchEnd);

function handleTouch(e) {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
}

function handleTouchEnd(e) {
    mouse.x = -1000;
    mouse.y = -1000;
    mouse.smoothX = -1000;
    mouse.smoothY = -1000;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createGrid();
    createWaves();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
createGrid();
createWaves();
animate();

// Add new event listeners
document.getElementById('blendMode').addEventListener('change', (e) => {
    settings.blendMode = e.target.value;
});

document.getElementById('plexEffect').addEventListener('change', (e) => {
    settings.plexEffect = e.target.checked;
});

document.getElementById('plexIntensity').addEventListener('input', (e) => {
    document.getElementById('plexIntensityValue').textContent = e.target.value;
    settings.plexIntensity = parseInt(e.target.value);
    waveLayers.forEach(layer => {
        layer.history = [];
        layer.maxHistory = Math.min(15, 10 + Math.floor(settings.plexIntensity/10)); // Limit to 15 max
    });
});

document.getElementById('glowEffect').addEventListener('change', (e) => {
    settings.glowEffect = e.target.checked;
});

document.getElementById('glowIntensity').addEventListener('input', (e) => {
    document.getElementById('glowIntensityValue').textContent = e.target.value;
    settings.glowIntensity = parseInt(e.target.value);
});

// Add to existing event listeners
document.getElementById('positionSpring').addEventListener('input', (e) => {
    document.getElementById('positionSpringValue').textContent = e.target.value;
    settings.positionSpring = parseFloat(e.target.value);
});

document.getElementById('velocityDamping').addEventListener('input', (e) => {
    document.getElementById('velocityDampingValue').textContent = e.target.value;
    settings.velocityDamping = parseFloat(e.target.value);
});

document.getElementById('maxAcceleration').addEventListener('input', (e) => {
    document.getElementById('maxAccelerationValue').textContent = e.target.value;
    settings.maxAcceleration = parseFloat(e.target.value);
});

// Add to existing event listeners
document.getElementById('turbulenceIntensity').addEventListener('input', (e) => {
    document.getElementById('turbulenceIntensityValue').textContent = e.target.value;
    settings.turbulenceIntensity = parseFloat(e.target.value);
});

document.getElementById('turbulenceOctaves').addEventListener('input', (e) => {
    document.getElementById('turbulenceOctavesValue').textContent = e.target.value;
    settings.turbulenceOctaves = parseInt(e.target.value);
});

document.getElementById('turbulenceChaos').addEventListener('input', (e) => {
    document.getElementById('turbulenceChaosValue').textContent = e.target.value;
    settings.turbulenceChaos = parseFloat(e.target.value);
});

document.getElementById('turbulenceVortex').addEventListener('input', (e) => {
    document.getElementById('turbulenceVortexValue').textContent = e.target.value;
    settings.turbulenceVortex = parseFloat(e.target.value);
});

document.getElementById('turbulenceDirection').addEventListener('input', (e) => {
    document.getElementById('turbulenceDirectionValue').textContent = e.target.value;
    settings.turbulenceDirection = parseInt(e.target.value);
});

function updateTurbulenceVisibility() {
    const type = settings.turbulenceType;
    const groups = document.querySelectorAll('[class*="turbulence-"]');
    
    groups.forEach(group => {
        const shouldShow = Array.from(group.classList).some(className => 
            className.startsWith('turbulence-') && 
            className === `turbulence-${type}`
        );
        
        group.classList.toggle('hidden', !shouldShow);
    });
}

// Initial call to set correct visibility
updateTurbulenceVisibility();

// Preset configurations
const builtInPresets = {
    calm: {
        waveAmplitude: 50,
        waveSpeed: 0.8,
        turbulence: 0.2,
        turbulenceType: 'sine',
        lineColor: '#4a90e2',
        blendMode: 'source-over'
    },
    storm: {
        waveAmplitude: 150,
        waveSpeed: 1.8,
        turbulence: 2.0,
        turbulenceType: 'perlin',
        turbulenceOctaves: 5,
        lineColor: '#2c3e50',
        backgroundColor: '#f0f0f0'
    },
    neon: {
        lineColor: '#00ff9d',
        blendMode: 'screen',
        glowEffect: true,
        glowIntensity: 80,
        backgroundColor: '#000000',
        plexEffect: true,
        plexIntensity: 75
    }
};

// Preset management
document.getElementById('savePresetBtn').addEventListener('click', () => {
    const presetName = prompt('Preset name:');
    if (presetName) {
        localStorage.setItem(`wavePreset_${presetName}`, JSON.stringify(settings));
        updatePresetList();
    }
});

document.getElementById('loadPresetBtn').addEventListener('click', () => {
    const presetName = document.getElementById('presetSelect').value;
    if (presetName === 'custom') return;
    
    const presetData = builtInPresets[presetName] || 
                      JSON.parse(localStorage.getItem(`wavePreset_${presetName}`));
    
    if (presetData) {
        Object.keys(presetData).forEach(key => {
            if (settings.hasOwnProperty(key)) {
                settings[key] = presetData[key];
            }
        });
        updateUI();
        createWaves();
    }
});

function updatePresetList() {
    const select = document.getElementById('presetSelect');
    select.innerHTML = '<option value="custom">Custom</option>';
    
    // Add built-in presets
    Object.keys(builtInPresets).forEach(preset => {
        const option = new Option(preset.charAt(0).toUpperCase() + preset.slice(1), preset);
        select.add(option);
    });
    
    // Add user presets
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('wavePreset_')) {
            const presetName = key.replace('wavePreset_', '');
            select.add(new Option(presetName, presetName));
        }
    });
}

// Initialize preset list
updatePresetList();

// Add similar visibility updates for other control groups
function updateLineStyleVisibility() {
    const style = settings.lineStyle;
    document.querySelectorAll('.line-style-control').forEach(control => {
        control.classList.toggle('hidden', !control.classList.contains(`line-style-${style}`));
    });
}

function updateControlVisibility() {
    // Glow effect controls
    document.getElementById('glowIntensity').parentElement.classList.toggle('hidden', !settings.glowEffect);
    
    // Trail effect controls
    document.getElementById('plexIntensity').parentElement.classList.toggle('hidden', !settings.plexEffect);
    
    // Background image controls
    document.getElementById('uploadButton').parentElement.classList.toggle('hidden', !!settings.backgroundImage);
}

// Add to all relevant event listeners
document.querySelectorAll('input, select').forEach(control => {
    control.addEventListener('change', updateControlVisibility);
});

// Initial update
updateControlVisibility();

document.getElementById('waveRotation').addEventListener('input', (e) => {
    document.getElementById('waveRotationValue').textContent = e.target.value;
    settings.waveRotation = parseInt(e.target.value);
    createWaves(); // Redraw waves with new rotation
});

document.getElementById('lineColor').addEventListener('input', (e) => {
    settings.lineColor = e.target.value;
});

// Add to existing event listeners
document.getElementById('globalThickness').addEventListener('input', (e) => {
    const globalThicknessValue = parseInt(e.target.value);
    document.getElementById('globalThicknessValue').textContent = globalThicknessValue;

    // Update all individual thickness values based on the global thickness
    for (let i = 0; i < settings.waveCount; i++) {
        settings.waveThickness[i] = globalThicknessValue;
    }
});

document.getElementById('thicknessVariation').addEventListener('input', (e) => {
    const variationValue = parseInt(e.target.value);
    document.getElementById('thicknessVariationValue').textContent = variationValue;

    // Update individual thickness values based on the global thickness and variation
    const globalThicknessValue = parseInt(document.getElementById('globalThickness').value);
    for (let i = 0; i < settings.waveCount; i++) {
        const randomVariation = Math.floor(Math.random() * (variationValue + 1));
        settings.waveThickness[i] = globalThicknessValue + randomVariation;
    }
});

function generateThicknessControls() {
    const thicknessControls = document.getElementById('thicknessControls');
    thicknessControls.innerHTML = ''; // Clear existing controls

    for (let i = 0; i < settings.waveCount; i++) {
        const controlDiv = document.createElement('div');
        controlDiv.classList.add('thickness-control');

        const label = document.createElement('label');
        label.setAttribute('for', `thickness${i + 1}`);
        label.textContent = `Layer ${i + 1}: `;

        const valueSpan = document.createElement('span');
        valueSpan.id = `thickness${i + 1}Value`;
        valueSpan.textContent = settings.waveThickness[i] || 3; // Use existing value or default

        const input = document.createElement('input');
        input.type = 'range';
        input.id = `thickness${i + 1}`;
        input.min = 1;
        input.max = 10;
        input.value = settings.waveThickness[i] || 3; // Use existing value or default

        input.addEventListener('input', (e) => {
            settings.waveThickness[i] = parseInt(e.target.value);
            valueSpan.textContent = e.target.value;
        });

        label.appendChild(valueSpan);
        controlDiv.appendChild(label);
        controlDiv.appendChild(input);
        thicknessControls.appendChild(controlDiv);
    }
}

// Call generateThicknessControls when waveCount changes
waveCountInput.addEventListener('input', () => {
    settings.waveThickness = Array(settings.waveCount).fill(3); // Reset thickness array
    generateThicknessControls();
});

// Initial call to generate thickness controls
generateThicknessControls(); 
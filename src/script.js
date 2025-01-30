const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Settings with default values
let settings = {
    gridSize: 50,
    lineStrength: 0.1,
    lineWidth: 1,
    lineColor: '#f0f0f0',
    mouseRadius: 100,
    elasticity: 0.3,
    friction: 0.9,
    colorMode: 'white',
    interactionMode: 'push',
    backgroundColor: '#1a1a1a',
    backgroundImage: null,
    lineStyle: 'solid',
    displayMode: 'waves',
    waveCount: 10,
    waveShape: 'sine',
    interactionStrength: 0.5
};

let mouse = { x: -1000, y: -1000, smoothX: -1000, smoothY: -1000, vx: 0, vy: 0 };
let gridPoints = [];
let gridLines = [];
let waveLayers = [];
let mouseTrail = [];
const trailLength = 20;

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
const clearButton = document.getElementById('clearButton');
const waveCountInput = document.getElementById('waveCount');
const interactionStrengthInput = document.getElementById('interactionStrength');
const controlsContainer = document.getElementById('controls-container');
const controls = document.getElementById('controls');
const controlsToggle = document.getElementById('controls-toggle');

// Radio buttons
const colorModeInputs = document.querySelectorAll('input[name="colorMode"]');
const interactionModeInputs = document.querySelectorAll('input[name="interactionMode"]');
const waveShapeInputs = document.querySelectorAll('input[name="waveShape"]');
const displayModeInputs = document.querySelectorAll('input[name="displayMode"]');

// Update value displays
gridSizeInput.addEventListener('input', (e) => {
    document.getElementById('gridSizeValue').textContent = e.target.value;
    settings.gridSize = parseInt(e.target.value);
    createGrid();
    createWaves();
});

waveCountInput.addEventListener('input', (e) => {
    document.getElementById('waveCountValue').textContent = e.target.value;
    settings.waveCount = parseInt(e.target.value);
    createWaves();
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
    document.getElementById('mouseRadiusValue').textContent = e.target.value;
    settings.mouseRadius = parseInt(e.target.value);
});

elasticityInput.addEventListener('input', (e) => {
    document.getElementById('elasticityValue').textContent = e.target.value;
    settings.elasticity = parseFloat(e.target.value);
});

frictionInput.addEventListener('input', (e) => {
    document.getElementById('frictionValue').textContent = e.target.value;
    settings.friction = parseFloat(e.target.value);
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

// Helper function for vector math
function vec2(x, y) {
    return { x: x, y: y };
}

function vec2Sub(v1, v2) {
    return vec2(v1.x - v2.x, v1.y - v2.y);
}

function vec2Len(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function vec2Scale(v, scale) {
    return vec2(v.x * scale, v.y * scale);
}

function vec2Normalize(v) {
    const len = vec2Len(v);
    return len > 0 ? vec2Scale(v, 1 / len) : vec2(0, 0);
}

class GridPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.vx = 0;
        this.vy = 0;
    }

    update(mouse) {
        const pos = vec2(this.x, this.y);
        const mousePos = vec2(mouse.smoothX, mouse.smoothY);
        const diff = vec2Sub(pos, mousePos);
        const dist = vec2Len(diff);
        let force = 0;

        if (dist < settings.mouseRadius * 2) {
            if (dist < settings.mouseRadius) {
                force = (settings.mouseRadius - dist) / settings.mouseRadius;
                let forceVec = vec2Scale(diff, force * settings.lineStrength * settings.interactionStrength);

                if (settings.interactionMode === 'push') {
                    this.vx += forceVec.x;
                    this.vy += forceVec.y;
                } else if (settings.interactionMode === 'pull') {
                    this.vx -= forceVec.x;
                    this.vy -= forceVec.y;
                } else if (settings.interactionMode === 'both') {
                    this.vx += forceVec.x;
                    this.vy += forceVec.y;
                } else if (settings.interactionMode === 'gravity') {
                    const gravityDir = vec2Normalize(diff);
                    this.vx -= gravityDir.x * settings.lineStrength * settings.interactionStrength;
                    this.vy -= gravityDir.y * settings.lineStrength * settings.interactionStrength;
                    this.x += gravityDir.x * settings.lineStrength * settings.interactionStrength;
                    this.y += gravityDir.y * settings.lineStrength * settings.interactionStrength;
                }
            }
        }

        const springX = (this.originalX - this.x) * settings.elasticity;
        const springY = (this.originalY - this.y) * settings.elasticity;

        this.vx += springX;
        this.vy += springY;

        this.vx *= settings.friction;
        this.vy *= settings.friction;

        this.x += this.vx;
        this.y += this.vy;
    }
}

class GridLine {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);

        if (settings.colorMode === 'rainbow') {
            const time = performance.now() / 1000;
            const hue = (time * 50) % 360;
            ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        } else if (settings.colorMode === 'velocity') {
            const speed = vec2Len(vec2(this.p1.vx, this.p1.vy));
            const colorValue = Math.min(speed * 50, 255);
            ctx.strokeStyle = `rgb(${colorValue}, ${255 - colorValue}, ${colorValue})`;
        } else {
            ctx.strokeStyle = settings.lineColor;
        }

        ctx.lineWidth = settings.lineWidth;
        if (settings.lineStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (settings.lineStyle === 'dotted') {
            ctx.setLineDash([1, 3]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.stroke();
    }
}

class WavePoint {
    constructor(x, y, offset) {
        this.x = x;
        this.y = y;
        this.originalY = y;
        this.offset = offset;
        this.vy = 0;
        this.prevY = y; // For velocity color mode
    }

    update(mouse, time) {
        const pos = vec2(this.x, this.y);
        const mousePos = vec2(mouse.smoothX, mouse.smoothY);
        const diff = vec2Sub(pos, mousePos);
        const dist = vec2Len(diff);
        let force = 0;

        if (Math.abs(mousePos.y - this.y) < settings.mouseRadius * 2) {
            if (dist < settings.mouseRadius) {
                force = (settings.mouseRadius - dist) / settings.mouseRadius;
                let forceVec = vec2Scale(diff, force * settings.lineStrength * settings.interactionStrength);

                if (settings.interactionMode === 'push') {
                    this.vy += forceVec.y;
                } else if (settings.interactionMode === 'pull') {
                    this.vy -= forceVec.y;
                } else if (settings.interactionMode === 'both') {
                    this.vy += forceVec.y;
                } else if (settings.interactionMode === 'gravity') {
                    const gravityDir = vec2Normalize(diff);
                    this.vy -= gravityDir.y * settings.lineStrength * settings.interactionStrength;
                    this.y += gravityDir.y * settings.lineStrength * settings.interactionStrength;
                }
            }
        }

        let waveHeight = 30;
        if (settings.waveShape === 'sine') {
            this.y = this.originalY + Math.sin(time + this.offset + this.x * 0.02) * waveHeight;
        } else if (settings.waveShape === 'square') {
            this.y = this.originalY + (Math.sin(time + this.offset + this.x * 0.02) > 0 ? waveHeight : -waveHeight);
        } else if (settings.waveShape === 'triangle') {
            this.y = this.originalY + (2 * Math.asin(Math.sin(time + this.offset + this.x * 0.02)) / Math.PI) * waveHeight;
        }

        const springY = (this.originalY - this.y) * settings.elasticity;
        this.vy += springY;
        this.vy *= settings.friction;
        this.y += this.vy;
    }
}

class WaveLayer {
    constructor(y, offset) {
        this.y = y;
        this.offset = offset;
        this.points = this.createPoints();
    }

    createPoints() {
        const points = [];
        const numPoints = Math.floor(canvas.width / settings.gridSize) + 1;
        for (let i = 0; i < numPoints; i++) {
            const x = i * settings.gridSize;
            points.push(new WavePoint(x, this.y, this.offset));
        }
        return points;
    }

    update(mouse, time) {
        for (let point of this.points) {
            point.update(mouse, time);
        }
    }

    draw(time) {
        ctx.beginPath();
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }

        if (settings.colorMode === 'rainbow') {
            const hue = (time * 50) % 360;
            ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        } else if (settings.colorMode === 'velocity') {
            // Calculate velocity based on the difference between current and previous y
            for (let i = 0; i < this.points.length; i++) {
                const point = this.points[i];
                const speed = Math.abs(point.y - point.prevY);
                const colorValue = Math.min(speed * 50, 255);
                ctx.strokeStyle = `rgb(${colorValue}, ${255 - colorValue}, ${colorValue})`;
                point.prevY = point.y; // Update previous y
            }
        } else {
            ctx.strokeStyle = settings.lineColor;
        }

        ctx.lineWidth = settings.lineWidth;
        if (settings.lineStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (settings.lineStyle === 'dotted') {
            ctx.setLineDash([1, 3]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.stroke();
    }
}

function createGrid() {
    gridPoints = [];
    gridLines = [];

    const numCols = Math.floor(canvas.width / settings.gridSize) + 1;
    const numRows = Math.floor(canvas.height / settings.gridSize) + 1;

    // Create grid points
    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols; x++) {
            gridPoints.push(new GridPoint(x * settings.gridSize, y * settings.gridSize));
        }
    }

    // Create horizontal lines
    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols - 1; x++) {
            const index = y * numCols + x;
            gridLines.push(new GridLine(gridPoints[index], gridPoints[index + 1]));
        }
    }

    // Create vertical lines
    for (let x = 0; x < numCols; x++) {
        for (let y = 0; y < numRows - 1; y++) {
            const index = y * numCols + x;
            gridLines.push(new GridLine(gridPoints[index], gridPoints[index + numCols]));
        }
    }
}

function createWaves() {
    waveLayers = [];
    const numLayers = settings.waveCount;
    const layerSpacing = canvas.height / (numLayers + 1);

    for (let i = 1; i <= numLayers; i++) {
        const y = layerSpacing * i;
        const offset = i * 0.5;
        waveLayers.push(new WaveLayer(y, offset));
    }
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

    // Update mouse position with smoothing
    const smoothFactor = 0.3;
    mouse.vx = (mouse.x - mouse.smoothX) * smoothFactor;
    mouse.vy = (mouse.y - mouse.smoothY) * smoothFactor;
    mouse.smoothX += mouse.vx;
    mouse.smoothY += mouse.vy;

    const time = performance.now() / 1000;

    if (settings.displayMode === 'grid') {
        // Update grid points
        for (let point of gridPoints) {
            point.update(mouse);
        }

        // Draw grid lines
        for (let line of gridLines) {
            line.draw();
        }
    } else if (settings.displayMode === 'waves') {
        for (let layer of waveLayers) {
            layer.update(mouse, time);
            layer.draw(time);
        }
    }

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
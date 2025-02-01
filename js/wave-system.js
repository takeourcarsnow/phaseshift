// Optimized WavePoint class with memoization and vector pooling
class WavePoint {
    constructor(x, y, offset) {
        this._pos = {x, y};
        this.originalY = y;
        this.offset = offset;
        this.vy = 0;
        this.prevY = y;
        this.influence = 0;
        this._vecPool = Array(5).fill().map(() => ({x: 0, y: 0}));
        this.targetAmplitude = settings.waveAmplitude;
        this.currentAmplitude = settings.waveAmplitude;
        
        // Initialize the p array for perlin noise
        this.p = new Array(512);
        for (let i = 0; i < 256; i++) {
            this.p[i] = this.p[i + 256] = Math.floor(Math.random() * 256);
        }
    }

    get x() { return this._pos.x; }
    get y() { return this._pos.y; }
    set y(v) { this._pos.y = v; }

    update(mouse, time, neighbors, allPoints) {
        // Add smooth amplitude interpolation
        this.currentAmplitude += (this.targetAmplitude - this.currentAmplitude) * 0.1;
        
        const [diff, mousePos, forceVec, gravityDir, unifiedForce] = this._vecPool;
        
        // Reuse vector objects
        mousePos.x = mouse.smoothX;
        mousePos.y = mouse.smoothY;
        diff.x = this.x - mousePos.x;
        diff.y = this.y - mousePos.y;
        
        const dist = Math.hypot(diff.x, diff.y);
        let force = 0;

        if (dist < settings.mouseRadius) {
            const normalizedDist = dist / settings.mouseRadius;
            force = (1 - normalizedDist) * settings.lineStrength * settings.interactionStrength;
            force *= (1 - normalizedDist ** 2);
            
            const mouseSpeed = Math.hypot(mouse.vx, mouse.vy);
            force *= Math.min(mouseSpeed, 5) * (0.5 + mouseSpeed/10);

            forceVec.x = diff.x * force;
            forceVec.y = diff.y * force;
            
            // ... rest of force calculations using vector pool ...
        }

        // Modify existing turbulence calculations to use smoothed amplitude
        const scaleFactor = settings.turbulenceScale * 0.01;
        const timeFactor = time * settings.turbulenceSpeed;
        let turbulence = 0;
        
        switch(settings.turbulenceType) {
            case 'perlin':
                turbulence = this._optimizedPerlinNoise(scaleFactor, timeFactor);
                break;
            // ... other cases with optimized math ...
        }

        // Apply smoothed amplitude to wave calculations
        const waveOffset = Math.sin(time * settings.waveSpeed + this.offset) * this.currentAmplitude;
        this.y = this.originalY + waveOffset + turbulence;
    }

    _optimizedPerlinNoise(scale, time) {
        const nx = this.x * 0.005 * scale + time * 0.2;
        return this.fbm(nx, time * 0.2, settings.turbulenceOctaves) * 0.5;
    }
    
    fbm(x, y, octaves) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        return total / maxValue;
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        
        console.log("X:", X, "Y:", Y);
        console.log("p[Y]:", this.p[Y]);
        
        const index1 = X + this.p[Y];
        const index2 = X + 1 + this.p[Y];
        const index3 = X + this.p[Y + 1];
        const index4 = X + 1 + this.p[Y + 1];
        
        console.log("index1:", index1);
        console.log("index2:", index2);
        console.log("index3:", index3);
        console.log("index4:", index4);
        
        const r1 = this.grad(this.p[index1 & 511], xf, yf);
        const r2 = this.grad(this.p[index2 & 511], xf - 1, yf);
        const r3 = this.grad(this.p[index3 & 511], xf, yf - 1);
        const r4 = this.grad(this.p[index4 & 511], xf - 1, yf - 1);
        
        console.log("p[X + p[Y]]:", this.p[index1 & 511]);
        console.log("p[X + 1 + p[Y]]:", this.p[index2 & 511]);
        console.log("p[X + p[Y + 1]]:", this.p[index3 & 511]);
        console.log("p[X + 1 + p[Y + 1]]:", this.p[index4 & 511]);
        
        const u = this.fade(xf);
        const v = this.fade(yf);
        return this.lerp(this.lerp(r1, r2, u), this.lerp(r3, r4, u), v);
    }

    grad(hash, x, y) {
        if (!this.p) {
            console.error("this.p is undefined in grad method");
            return 0;
        }
        const h = hash & 7;
        let unitVector = {x: 0, y: 0};
        switch (h) {
            case 0: unitVector = {x: 1, y: 1}; break;
            case 1: unitVector = {x: -1, y: 1}; break;
            case 2: unitVector = {x: 1, y: -1}; break;
            case 3: unitVector = {x: -1, y: -1}; break;
            case 4: unitVector = {x: 1, y: 0}; break;
            case 5: unitVector = {x: -1, y: 0}; break;
            case 6: unitVector = {x: 0, y: 1}; break;
            case 7: unitVector = {x: 0, y: -1}; break;
        }
        return x * unitVector.x + y * unitVector.y;
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
}

// Add wave system stabilization method
function stabilizeWaveSystem() {
    waveLayers.forEach(wave => {
        wave.points.forEach(point => {
            point.targetAmplitude = settings.waveAmplitude;
            point.currentAmplitude = settings.waveAmplitude;
            point.vy *= 0.8; // Add damping when changing wave count
        });
    });
}

// Modify the wave count handler in your settings.js
document.getElementById('waveCount').addEventListener('input', function(e) {
    settings.waveCount = parseInt(e.target.value);
    document.getElementById('waveCountValue').textContent = settings.waveCount;
    
    // Redistribute waves smoothly
    redistributeWaves();
    stabilizeWaveSystem();
});

function redistributeWaves() {
    const transitionDuration = 500; // 0.5 second transition
    const startTime = Date.now();
    
    function animate() {
        const progress = (Date.now() - startTime) / transitionDuration;
        
        waveLayers = waveLayers.slice(0, settings.waveCount).map((wave, index) => {
            const targetY = canvas.height / 2 + (index - settings.waveCount/2) * settings.waveSpacing;
            wave.points.forEach(point => {
                point.originalY += (targetY - point.originalY) * 0.1;
                point.y += (targetY - point.y) * 0.1;
            });
            return wave;
        });
        
        if (progress < 1) requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
}

function createWaves() {
    waveLayers = [];
    const baseY = canvas.height / 2;
    const spacing = settings.waveSpacing;
    
    for(let i = 0; i < settings.waveCount; i++) {
        const yOffset = (i - settings.waveCount/2) * spacing;
        waveLayers.push({
            points: createWavePoints(),
            frequency: 0.01 * (i + 1),
            phase: 0,
            amplitude: settings.waveAmplitude,
            yOffset: yOffset,
            targetY: baseY + yOffset
        });
    }
    
    // Force position synchronization
    const time = performance.now() / 1000;
    waveLayers.forEach(wave => {
        wave.points.forEach(point => {
            point.originalY = wave.targetY;
            point.y = wave.targetY;
        });
    });
    
    updateWaves(mouse, time);
    drawWaves(time);
} 
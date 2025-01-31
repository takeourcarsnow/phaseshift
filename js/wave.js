class WavePoint {
    constructor(x, y, offset) {
        this.x = x;
        this.y = y;
        this.originalY = y;
        this.offset = offset;
        this.vy = 0;
        this.prevY = y;
        this.influence = 0;
    }

    update(mouse, time, neighbors, allPoints) {
        const pos = vec2(this.x, this.y);
        const mousePos = vec2(mouse.smoothX, mouse.smoothY);
        const diff = vec2Sub(pos, mousePos);
        const dist = vec2Len(diff);
        let force = 0;

        // Smooth force application
        if (Math.abs(mousePos.y - this.y) < settings.mouseRadius * 2) {
            if (dist < settings.mouseRadius) {
                const normalizedDist = dist / settings.mouseRadius;
                // Scale force based on distance
                force = (1 - normalizedDist) * settings.lineStrength * settings.interactionStrength;
                force *= (1 - Math.pow(normalizedDist, 2)); // Non-linear scaling
                
                // Velocity-based force scaling with non-linear response
                const mouseSpeed = vec2Len(vec2(mouse.vx, mouse.vy));
                force *= Math.min(mouseSpeed, 5) * (0.5 + mouseSpeed/10);

                let forceVec = vec2Scale(diff, force);

                // Limit vertical force and add horizontal spread
                forceVec.y *= 0.5; // Reduce vertical force by half
                forceVec.x *= 0.2; // Add a small horizontal force component

                if (settings.interactionMode === 'push') {
                    this.vy += forceVec.y;
                    if (neighbors.length > 0) { // Apply horizontal force to neighbors
                        neighbors[0].vy += forceVec.x * 0.5;
                        neighbors[neighbors.length - 1].vy += forceVec.x * 0.5;
                    }
                } else if (settings.interactionMode === 'pull') {
                    this.vy -= forceVec.y;
                    if (neighbors.length > 0) { // Apply horizontal force to neighbors
                        neighbors[0].vy -= forceVec.x * 0.5;
                        neighbors[neighbors.length - 1].vy -= forceVec.x * 0.5;
                    }
                } else if (settings.interactionMode === 'both') {
                    this.vy += forceVec.y;
                } else if (settings.interactionMode === 'gravity') {
                    const gravityDir = vec2Normalize(diff);
                    const gravityForce = settings.lineStrength * settings.interactionStrength * 3; // Increased force multiplier
                    this.vy -= gravityDir.y * gravityForce;
                    this.y += gravityDir.y * gravityForce * 0.5; // Direct position adjustment
                }
            }
        }

        // Apply damping and force limits
        const dt = 16/1000; // Approximate delta time for 60fps
        force = Math.min(force, settings.maxForce);
        
        // Add position-based spring force
        const positionSpring = (this.originalY - this.y) * settings.positionSpring * dt;
        this.vy += positionSpring;

        // Modified velocity damping
        this.vy -= this.vy * settings.velocityDamping * dt;

        // Enhanced neighbor influence
        let neighborInfluence = 0;
        if (neighbors) {
            neighbors.forEach(neighbor => {
                const dy = neighbor.y - this.y;
                const influence = dy * settings.neighborInfluence * (1 - Math.abs(dy)/50);
                neighborInfluence += influence;
            });
            neighborInfluence /= neighbors.length;
            neighborInfluence *= dt; // Make time-step independent
        }
        this.vy += neighborInfluence;

        // Enhanced turbulence system
        let turbulence = 0;
        const scaleFactor = settings.turbulenceScale / 100;
        const timeFactor = time * settings.turbulenceSpeed;
        
        switch(settings.turbulenceType) {
            case 'perlin':
                // Improved Perlin noise implementation
                turbulence = this.fbm(
                    this.x * 0.005 * scaleFactor + timeFactor,
                    timeFactor,
                    settings.turbulenceOctaves
                ) * settings.turbulenceIntensity;
                break;

            case 'vortex':
                // Swirling vortex pattern
                const angle = Math.atan2(this.y - canvas.height/2, this.x - canvas.width/2);
                turbulence = Math.sin(angle * 5 + timeFactor * 2) * 
                           Math.cos(timeFactor) * 
                           settings.turbulenceVortex;
                break;

            case 'chaos':
                // Random chaotic movement
                turbulence = (Math.random() - 0.5) * 
                           settings.turbulenceChaos * 
                           Math.sin(timeFactor);
                break;

            case 'directional':
                // Directional waves
                turbulence = Math.sin(
                    (this.x * Math.cos(settings.turbulenceDirection) + 
                     this.y * Math.sin(settings.turbulenceDirection)) * 0.01 * scaleFactor + 
                    timeFactor
                ) * settings.turbulenceIntensity;
                break;

            case 'sine':
                turbulence = Math.sin(timeFactor * 0.8 + this.x * 0.01 * scaleFactor) * 
                            Math.cos(timeFactor * 0.6 + this.x * 0.015 * scaleFactor);
                break;
                
            case 'noise':
                // Implement smoother fractional Brownian motion
                let nx = this.x * 0.005 * scaleFactor + timeFactor * 0.2;
                let ny = timeFactor * 0.2; // Remove y-position dependency
                turbulence = this.fbm(nx, ny, 3) * 0.5;
                break;
                
            case 'random':
                const pulse = Math.sin(timeFactor * 2 + this.x * 0.05) > 0.95 ? 
                            Math.random() * 2 - 1 : 0;
                turbulence = pulse * (0.5 + Math.sin(timeFactor * 0.3) * 0.5);
                break;

            case 'sawtooth':
                turbulence = (this.x / canvas.width) * settings.turbulenceIntensity;
                break;

            case 'pulse':
                turbulence = Math.sin(timeFactor * 5) * settings.turbulenceIntensity;
                break;
        }

        // Add complexity layers
        for(let i = 1; i <= settings.turbulenceComplexity; i++) {
            const freq = 0.02 * i;
            turbulence += Math.sin(timeFactor * 0.4 * i + this.x * freq * scaleFactor) * 
                        Math.cos(timeFactor * 0.3 * i + this.x * freq * 1.2 * scaleFactor) * 
                        (1 / i);
        }

        turbulence *= settings.turbulence;
        const basePhase = (this.x * 0.015) - (time * settings.waveSpeed) + this.offset;
        const finalPhase = basePhase + (turbulence * scaleFactor); // Apply scale only to turbulence

        // Unified interaction mode - calculate average Y once per frame
        if (settings.interactionMode === 'unified') {
            if (!this.frameAvgY) { // Calculate average Y once per frame
                this.frameAvgY = allPoints.reduce((sum, p) => sum + p.y, 0) / allPoints.length;
            }
            const unifiedForce = (this.frameAvgY - this.y) * 0.1 * settings.interactionStrength;
            this.vy += unifiedForce;
        }

        let waveHeight = settings.waveAmplitude * 2;
        let idealY = this.originalY;
        if (settings.waveShape === 'sine') {
            idealY += Math.sin(finalPhase) * waveHeight;
        } else if (settings.waveShape === 'square') {
            idealY += (Math.sin(finalPhase) > 0 ? waveHeight : -waveHeight);
        } else if (settings.waveShape === 'triangle') {
            idealY += (2 * Math.asin(Math.sin(finalPhase)) / Math.PI) * waveHeight;
        } else if (settings.waveShape === 'sawtooth') {
            const phase = finalPhase % (2 * Math.PI);
            idealY += ((phase / Math.PI) - 1) * waveHeight; // Centered sawtooth
        } else if (settings.waveShape === 'pulse') {
            idealY += (Math.sin(finalPhase * 2) > 0 ? waveHeight : -waveHeight);
        }

        // Curve force
        const curveForce = (idealY - this.y) * 0.05;
        this.vy += curveForce;

        // Add position-based spring force
        const springY = (this.originalY - this.y) * settings.elasticity * dt;
        this.vy += springY;
        this.vy *= (1 - settings.friction);

        // Enhanced acceleration limits
        const MAX_ACCELERATION = settings.maxAcceleration;
        this.vy = Math.max(-MAX_ACCELERATION, Math.min(this.vy, MAX_ACCELERATION));

        this.y += this.vy;

        // Apply smoothing
        this.smooth(neighbors);

        // Limit maximum velocity
        const MAX_VELOCITY = 100; // Adjust as necessary
        this.vy = Math.max(-MAX_VELOCITY, Math.min(this.vy, MAX_VELOCITY));

        // Apply damping
        this.vy *= (1 - settings.velocityDamping);
    }

    smooth(neighbors) {
        if (neighbors.length > 0) {
            let avgY = this.y;
            neighbors.forEach(neighbor => {
                avgY += neighbor.y;
            });
            avgY /= (neighbors.length + 1); // Include self
            this.y = avgY; // Smooth the position
        }
    }

    fbm(x, y, octaves) {
        let value = 0;
        let amplitude = 0.5;
        for(let i = 0; i < octaves; i++) {
            value += amplitude * this.noise(x, y);
            x *= 2.0;
            y *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }

    grad(x, y, dx, dy) {
        const hash = (x + y * 57) % 16;
        const grad = [
            [1, 1], [-1, 1], [1, -1], [-1, -1],
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [-1, 1], [1, -1], [-1, -1],
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ][hash];
        return grad[0] * dx + grad[1] * dy;
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    noise(x, y) {
        const X = Math.floor(x) % 256;
        const Y = Math.floor(y) % 256;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = x * x * (3 - 2 * x);
        const v = y * y * (3 - 2 * y);
        return this.lerp(
            this.lerp(this.grad(X, Y, x, y), this.grad(X+1, Y, x-1, y), u),
            this.lerp(this.grad(X, Y+1, x, y-1), this.grad(X+1, Y+1, x-1, y-1), u), 
            v
        );
    }
}

class WaveLayer {
    constructor(y, offset, index) {
        this.y = y;
        this.offset = offset;
        this.points = this.createPoints();
        this.index = index;
        this.hue = (this.index * 20) % 360;
        this.history = []; // Store previous positions for echo effect
        this.maxHistory = 20; // Number of echo layers to keep
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
        // Reset frameAvgY at the start of each frame
        this.points.forEach(p => p.frameAvgY = null);

        const allPoints = this.points; // Get reference to all points
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const neighbors = [];
            if (i > 0) neighbors.push(this.points[i - 1]);
            if (i < this.points.length - 1) neighbors.push(this.points[i + 1]);
            point.update(mouse, time, neighbors, allPoints); // Pass allPoints
        }
        
        // Store current positions in history
        const currentPositions = this.points.map(p => p.y);
        this.history.unshift(currentPositions);
        if(this.history.length > this.maxHistory) this.history.pop();
    }

    draw(time) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((settings.waveRotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Draw echo effect first
        if (settings.plexEffect) {
            ctx.globalCompositeOperation = 'screen';
            // Adjust maxHistory calculation to work for all line thicknesses
            const maxHistory = Math.max(5, Math.floor(20 / Math.sqrt(settings.globalThickness || 1)));
            for (let i = 0; i < Math.min(this.history.length, maxHistory); i += 1) {
                const positions = this.history[i];
                const alpha = (1 - (i/this.history.length)) * 0.5 * (settings.plexIntensity/100);
                const spread = i * 0.2 * (settings.plexIntensity/100);
                
                ctx.beginPath();
                ctx.moveTo(this.points[0].x, positions[0] + spread);
                // Draw with reduced resolution
                for (let j = 0; j < positions.length - 1; j += 2) {
                    const x = this.points[j].x;
                    const y = positions[j] + spread;
                    const nextX = this.points[j+1].x;
                    const nextY = positions[j+1] + spread;
                    
                    ctx.lineTo(nextX, nextY);
                }
                
                ctx.strokeStyle = `hsla(${this.hue}, 70%, 60%, ${alpha})`;
                ctx.lineWidth = settings.globalThickness * 1.2;
                ctx.stroke();
            }
        }

        // Glow effect
        if (settings.glowEffect) {
            const glowIntensity = settings.glowIntensity / 100;
            const glowColor = settings.lineColor || '#ffffff';
            
            // Create multiple glow layers with decreasing opacity
            const glowLayers = [
                { blur: 20 * glowIntensity, opacity: 0.6 * glowIntensity },
                { blur: 40 * glowIntensity, opacity: 0.4 * glowIntensity },
                { blur: 60 * glowIntensity, opacity: 0.2 * glowIntensity }
            ];

            // Draw glow layers
            glowLayers.forEach(layer => {
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.filter = `blur(${layer.blur}px) brightness(200%)`;
                ctx.globalAlpha = layer.opacity;
                
                // Draw the wave path with reduced resolution
                ctx.beginPath();
                for (let i = 0; i < this.points.length - 1; i += 2) {
                    const p1 = this.points[i];
                    const p2 = this.points[i + 1];
                    if (i === 0) ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                }
                
                ctx.strokeStyle = glowColor;
                ctx.lineWidth = settings.globalThickness * 2;
                ctx.stroke();
                ctx.restore();
            });
        }

        // Draw main wave with reduced resolution for thicker lines
        ctx.globalCompositeOperation = settings.blendMode;
        ctx.beginPath();
        const step = settings.globalThickness > 3 ? 2 : 1; // Reduce resolution for thicker lines
        for (let i = 0; i < this.points.length - 1; i += step) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            if (i === 0) ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }

        // Set stroke style based on color mode
        if (settings.colorMode === 'rainbow') {
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
        } else if (settings.colorMode === 'velocity') {
            const gradient = ctx.createLinearGradient(
                this.points[0].x, 0, 
                this.points[this.points.length-1].x, 0
            );
            for (let i = 0; i < this.points.length; i += step) {
                const point = this.points[i];
                const speed = Math.abs(point.y - point.prevY);
                const colorValue = Math.min(speed * 50, 255);
                const stopPos = i / (this.points.length - 1);
                gradient.addColorStop(stopPos, `rgb(${colorValue}, ${255 - colorValue}, ${colorValue})`);
                point.prevY = point.y;
            }
            ctx.strokeStyle = gradient;
        } else {
            ctx.strokeStyle = settings.lineColor;
        }

        ctx.lineWidth = settings.globalThickness;
        if (settings.lineStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (settings.lineStyle === 'dotted') {
            ctx.setLineDash([1, 3]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.stroke();
        ctx.restore();
    }
}

let waveLayers = [];

function createWaves() {
    waveLayers = [];
    const numLayers = settings.waveCount;
    const layerSpacing = settings.waveSpacing;
    
    // Create layers from top to bottom with consistent spacing
    const startY = (canvas.height - (numLayers - 1) * layerSpacing) / 2;
    
    for (let i = 0; i < numLayers; i++) {
        const y = startY + (i * layerSpacing);
        const offset = (i + 1) * 0.5;
        waveLayers.push(new WaveLayer(y, offset, i + 1));
    }
}

function updateWaves(mouse, time) {
    for (let layer of waveLayers) {
        layer.update(mouse, time);
    }
}

function drawWaves(time) {
    for (let layer of waveLayers) {
        layer.draw(time);
    }
}

function handleResize() {
  // Add slight delay to ensure proper dimensions
  setTimeout(() => {
    canvas.width = Math.min(window.innerWidth, 1920);
    canvas.height = window.innerHeight;
    
    // If menu is closed, maintain aspect ratio
    if (!menuOpen) {
      const aspectRatio = 16 / 9;
      canvas.width = Math.min(window.innerWidth, 1920);
      canvas.height = canvas.width / aspectRatio;
    }
    
    initWave(); // Reinitialize wave parameters
  }, 100);
}

// Add orientationchange listener
window.addEventListener('orientationchange', handleResize);

// Add this function to generate random values
function getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
}

// Add this keydown listener
window.addEventListener('keydown', function(event) {
    if (event.key === 'r' || event.key === 'R') {
        // Simulate click on the random button
        document.getElementById('randomButton').click();
    }
});

// Add this function to randomize turbulence settings
function randomizeTurbulence() {
    const turbulenceTypes = ['sine', 'noise', 'perlin', 'vortex', 'chaos', 'directional', 'random'];
    settings.turbulenceType = turbulenceTypes[Math.floor(Math.random() * turbulenceTypes.length)];
    settings.turbulence = getRandomValue(0, 2);
    settings.turbulenceSpeed = getRandomValue(0.1, 2.0);
    settings.turbulenceScale = getRandomValue(10, 200);
    settings.turbulenceIntensity = getRandomValue(0.1, 3.0);
    settings.turbulenceDirection = getRandomValue(0, 360);
    
    // Update UI elements
    document.querySelector(`input[name="turbulenceType"][value="${settings.turbulenceType}"]`).checked = true;
    document.getElementById('turbulence').value = settings.turbulence;
    document.getElementById('turbulenceValue').textContent = settings.turbulence.toFixed(1);
    document.getElementById('turbulenceSpeed').value = settings.turbulenceSpeed;
    document.getElementById('turbulenceSpeedValue').textContent = settings.turbulenceSpeed.toFixed(1);
    document.getElementById('turbulenceScale').value = settings.turbulenceScale;
    document.getElementById('turbulenceScaleValue').textContent = Math.round(settings.turbulenceScale);
    document.getElementById('turbulenceIntensity').value = settings.turbulenceIntensity;
    document.getElementById('turbulenceIntensityValue').textContent = settings.turbulenceIntensity.toFixed(1);
    document.getElementById('turbulenceDirection').value = settings.turbulenceDirection;
    document.getElementById('turbulenceDirectionValue').textContent = Math.round(settings.turbulenceDirection);
}

// Modify the random button click handler to include turbulence randomization
document.getElementById('randomButton').addEventListener('click', function() {
    // Existing randomization logic...
    randomizeTurbulence();
    // Trigger redraw
    createWaves();
});

// Force the canvas to redraw immediately after thickness change
document.getElementById('globalThickness').addEventListener('input', () => {
    const time = performance.now() / 1000;
    updateWaves(mouse, time);
    drawWaves(time);
}); 
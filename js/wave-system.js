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
    }

    get x() { return this._pos.x; }
    get y() { return this._pos.y; }
    set y(v) { this._pos.y = v; }

    update(mouse, time, neighbors, allPoints) {
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

        // Turbulence calculations with precomputed values
        const scaleFactor = settings.turbulenceScale * 0.01;
        const timeFactor = time * settings.turbulenceSpeed;
        let turbulence = 0;
        
        switch(settings.turbulenceType) {
            case 'perlin':
                turbulence = this._optimizedPerlinNoise(scaleFactor, timeFactor);
                break;
            // ... other cases with optimized math ...
        }

        // ... rest of update logic with reused vectors ...
    }

    _optimizedPerlinNoise(scale, time) {
        const nx = this.x * 0.005 * scale + time * 0.2;
        return this.fbm(nx, time * 0.2, settings.turbulenceOctaves) * 0.5;
    }
} 
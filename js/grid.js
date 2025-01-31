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
    constructor(p1, p2, index) {
        this.p1 = p1;
        this.p2 = p2;
        this.index = index;
        this.hue = (this.index * 10) % 360;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);

        if (settings.colorMode === 'rainbow') {
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
        } else if (settings.colorMode === 'velocity') {
            const speed = Math.abs(this.p2.y - this.p1.y) + Math.abs(this.p2.x - this.p1.x);
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

let gridPoints = [];
let gridLines = [];

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

    let lineIndex = 0;
    // Create horizontal lines
    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols - 1; x++) {
            const index = y * numCols + x;
            gridLines.push(new GridLine(gridPoints[index], gridPoints[index + 1], lineIndex++));
        }
    }

    // Create vertical lines
    for (let x = 0; x < numCols; x++) {
        for (let y = 0; y < numRows - 1; y++) {
            const index = y * numCols + x;
            gridLines.push(new GridLine(gridPoints[index], gridPoints[index + numCols], lineIndex++));
        }
    }
}

function updateGrid(mouse) {
    for (let point of gridPoints) {
        point.update(mouse);
    }
}

function drawGrid() {
    for (let line of gridLines) {
        line.draw();
    }
} 
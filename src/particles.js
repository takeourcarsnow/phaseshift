class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = Math.random() * 2;
        this.alpha = Math.random() * 0.5;
        this.color = `hsla(${Math.random() * 360}, 70%, 50%, ${this.alpha})`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

const particles = Array(100).fill().map(() => new Particle());

function updateParticles() {
    particles.forEach(p => p.update());
}

function drawParticles() {
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => p.draw());
    ctx.globalCompositeOperation = settings.blendMode;
} 
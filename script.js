// Starlight Canvas - Interactive Constellation Creator

class StarlightCanvas {
    constructor() {
        this.canvas = document.getElementById('constellation-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.stars = [];
        this.lines = [];
        this.selectedStar = null;
        this.isDragging = false;
        this.mousePos = { x: 0, y: 0 };
        
        this.settings = {
            starSize: 5,
            starColor: '#FFFFFF',
            lineStyle: 'solid'
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createBackgroundStars();
        this.setupEventListeners();
        this.startAnimation();
        this.startShootingStars();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createBackgroundStars() {
        const container = document.getElementById('background-stars');
        container.innerHTML = '';
        const numStars = Math.floor((window.innerWidth * window.innerHeight) / 8000);
        
        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            star.className = 'bg-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = Math.random() * 2 + 1 + 'px';
            star.style.height = star.style.width;
            star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
            star.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(star);
        }
    }
    
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createBackgroundStars();
        });
        
        // Toolbar controls
        document.getElementById('star-size').addEventListener('input', (e) => {
            this.settings.starSize = parseInt(e.target.value);
        });
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.starColor = e.target.dataset.color;
            });
        });
        
        document.getElementById('line-style').addEventListener('change', (e) => {
            this.settings.lineStyle = e.target.value;
        });
        
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('save-btn').addEventListener('click', () => this.saveImage());
        document.getElementById('random-btn').addEventListener('click', () => this.addRandomStars());
    }
    
    handleClick(e) {
        if (this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicked on existing star
        const clickedStar = this.getStarAtPosition(x, y);
        
        if (!clickedStar) {
            // Create new star
            this.addStar(x, y);
        }
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedStar = this.getStarAtPosition(x, y);
        
        if (clickedStar) {
            this.selectedStar = clickedStar;
            this.isDragging = true;
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    }
    
    handleMouseUp(e) {
        if (this.isDragging && this.selectedStar) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const targetStar = this.getStarAtPosition(x, y);
            
            if (targetStar && targetStar !== this.selectedStar) {
                this.addLine(this.selectedStar, targetStar);
            }
        }
        
        this.selectedStar = null;
        this.isDragging = false;
    }
    
    handleRightClick(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedStar = this.getStarAtPosition(x, y);
        
        if (clickedStar) {
            this.removeStar(clickedStar);
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const clickedStar = this.getStarAtPosition(x, y);
        
        if (clickedStar) {
            this.selectedStar = clickedStar;
            this.isDragging = true;
        } else {
            this.addStar(x, y);
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = touch.clientX - rect.left;
        this.mousePos.y = touch.clientY - rect.top;
    }
    
    handleTouchEnd(e) {
        if (this.isDragging && this.selectedStar) {
            const targetStar = this.getStarAtPosition(this.mousePos.x, this.mousePos.y);
            
            if (targetStar && targetStar !== this.selectedStar) {
                this.addLine(this.selectedStar, targetStar);
            }
        }
        
        this.selectedStar = null;
        this.isDragging = false;
    }
    
    getStarAtPosition(x, y) {
        for (const star of this.stars) {
            const distance = Math.sqrt((x - star.x) ** 2 + (y - star.y) ** 2);
            if (distance <= star.size + 10) {
                return star;
            }
        }
        return null;
    }
    
    addStar(x, y) {
        const star = {
            id: Date.now() + Math.random(),
            x,
            y,
            size: this.settings.starSize,
            color: this.settings.starColor,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.02 + Math.random() * 0.03
        };
        
        this.stars.push(star);
        this.updateStats();
        this.createStarBurst(x, y, star.color);
    }
    
    removeStar(star) {
        // Remove all lines connected to this star
        this.lines = this.lines.filter(line => 
            line.star1.id !== star.id && line.star2.id !== star.id
        );
        
        // Remove the star
        this.stars = this.stars.filter(s => s.id !== star.id);
        this.updateStats();
    }
    
    addLine(star1, star2) {
        // Check if line already exists
        const exists = this.lines.some(line =>
            (line.star1.id === star1.id && line.star2.id === star2.id) ||
            (line.star1.id === star2.id && line.star2.id === star1.id)
        );
        
        if (!exists) {
            this.lines.push({
                star1,
                star2,
                style: this.settings.lineStyle,
                color: this.blendColors(star1.color, star2.color)
            });
            this.updateStats();
        }
    }
    
    blendColors(color1, color2) {
        // Simple color blend for line gradient
        return `linear-gradient(${color1}, ${color2})`;
    }
    
    clearAll() {
        this.stars = [];
        this.lines = [];
        this.updateStats();
    }
    
    addRandomStars() {
        const numStars = 10 + Math.floor(Math.random() * 15);
        const colors = ['#FFFFFF', '#FFE4B5', '#87CEEB', '#FFB6C1', '#98FB98', '#DDA0DD'];
        
        for (let i = 0; i < numStars; i++) {
            const margin = 150;
            const x = margin + Math.random() * (this.canvas.width - margin * 2);
            const y = margin + Math.random() * (this.canvas.height - margin * 2);
            
            const star = {
                id: Date.now() + Math.random(),
                x,
                y,
                size: 3 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.02 + Math.random() * 0.03
            };
            
            this.stars.push(star);
        }
        
        // Randomly connect some stars
        for (let i = 0; i < numStars / 2; i++) {
            const star1 = this.stars[Math.floor(Math.random() * this.stars.length)];
            const star2 = this.stars[Math.floor(Math.random() * this.stars.length)];
            
            if (star1 !== star2) {
                const distance = Math.sqrt((star1.x - star2.x) ** 2 + (star1.y - star2.y) ** 2);
                if (distance < 300) {
                    this.addLine(star1, star2);
                }
            }
        }
        
        this.updateStats();
    }
    
    saveImage() {
        // Create a temporary canvas with background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw background gradient
        const gradient = tempCtx.createLinearGradient(0, 0, 0, tempCanvas.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#1a1a3a');
        gradient.addColorStop(1, '#0a0a2a');
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw some background stars
        for (let i = 0; i < 200; i++) {
            tempCtx.beginPath();
            tempCtx.arc(
                Math.random() * tempCanvas.width,
                Math.random() * tempCanvas.height,
                Math.random() * 1.5,
                0, Math.PI * 2
            );
            tempCtx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`;
            tempCtx.fill();
        }
        
        // Draw lines
        this.lines.forEach(line => {
            this.drawLineOnContext(tempCtx, line);
        });
        
        // Draw stars
        this.stars.forEach(star => {
            this.drawStarOnContext(tempCtx, star, 1);
        });
        
        // Add watermark
        tempCtx.font = '14px "Space Mono", monospace';
        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        tempCtx.fillText('✨ Created with Starlight Canvas', 20, tempCanvas.height - 20);
        
        // Download
        const link = document.createElement('a');
        link.download = `starlight-canvas-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
    
    createStarBurst(x, y, color) {
        // Create particle burst effect
        const particles = [];
        const numParticles = 8;
        
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            particles.push({
                x, y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                life: 1,
                color
            });
        }
        
        const animateBurst = () => {
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.05;
                
                if (p.life > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color;
                    this.ctx.globalAlpha = p.life;
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1;
                }
            });
            
            if (particles.some(p => p.life > 0)) {
                requestAnimationFrame(animateBurst);
            }
        };
        
        animateBurst();
    }
    
    startShootingStars() {
        const createShootingStar = () => {
            const container = document.getElementById('shooting-stars');
            const star = document.createElement('div');
            star.className = 'shooting-star';
            star.style.left = (Math.random() * 100) + '%';
            star.style.top = (Math.random() * 50) + '%';
            container.appendChild(star);
            
            setTimeout(() => star.remove(), 1000);
        };
        
        // Random shooting stars
        setInterval(() => {
            if (Math.random() < 0.3) {
                createShootingStar();
            }
        }, 2000);
    }
    
    updateStats() {
        document.getElementById('star-count').textContent = this.stars.length;
        document.getElementById('line-count').textContent = this.lines.length;
    }
    
    startAnimation() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw connecting lines
            this.lines.forEach(line => {
                this.drawLine(line);
            });
            
            // Draw drag preview line
            if (this.isDragging && this.selectedStar) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.selectedStar.x, this.selectedStar.y);
                this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
                this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.5)';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([5, 5]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
            
            // Draw stars
            this.stars.forEach(star => {
                star.twinklePhase += star.twinkleSpeed;
                const twinkle = 0.6 + 0.4 * Math.sin(star.twinklePhase);
                this.drawStar(star, twinkle);
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    drawLine(line) {
        this.drawLineOnContext(this.ctx, line);
    }
    
    drawLineOnContext(ctx, line) {
        ctx.beginPath();
        ctx.moveTo(line.star1.x, line.star1.y);
        ctx.lineTo(line.star2.x, line.star2.y);
        
        // Create gradient for line
        const gradient = ctx.createLinearGradient(
            line.star1.x, line.star1.y,
            line.star2.x, line.star2.y
        );
        gradient.addColorStop(0, line.star1.color);
        gradient.addColorStop(1, line.star2.color);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        
        // Apply line style
        switch (line.style) {
            case 'dashed':
                ctx.setLineDash([10, 5]);
                break;
            case 'dotted':
                ctx.setLineDash([2, 4]);
                break;
            default:
                ctx.setLineDash([]);
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawStar(star, twinkle) {
        this.drawStarOnContext(this.ctx, star, twinkle);
    }
    
    drawStarOnContext(ctx, star, twinkle) {
        const size = star.size * twinkle;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, size * 3
        );
        glowGradient.addColorStop(0, star.color);
        glowGradient.addColorStop(0.5, this.hexToRgba(star.color, 0.3));
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // Inner star
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
        
        // Sparkle effect (4-pointed star)
        ctx.beginPath();
        ctx.moveTo(star.x - size * 2, star.y);
        ctx.lineTo(star.x + size * 2, star.y);
        ctx.moveTo(star.x, star.y - size * 2);
        ctx.lineTo(star.x, star.y + size * 2);
        ctx.strokeStyle = this.hexToRgba(star.color, 0.4 * twinkle);
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        }
        return `rgba(255, 255, 255, ${alpha})`;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new StarlightCanvas();
});

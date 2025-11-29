import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise@4.0.0';

export class Waves {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.error("Waves container not found");
            return;
        }

        this.options = {
            strokeColor: options.strokeColor || "#ffffff",
            backgroundColor: options.backgroundColor || "transparent", // Default to transparent so it overlays/underlays correctly
            pointerSize: options.pointerSize || 0.5,
        };

        this.svg = null;
        this.paths = [];
        this.lines = [];
        this.noise = null;
        this.raf = null;
        this.bounding = null;

        this.mouse = {
            x: -10,
            y: 0,
            lx: 0,
            ly: 0,
            sx: 0,
            sy: 0,
            v: 0,
            vs: 0,
            a: 0,
            set: false,
        };

        this.init();
    }

    init() {
        // Create SVG element
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.style.display = 'block';
        this.svg.style.width = '100%';
        this.svg.style.height = '100%';
        this.container.appendChild(this.svg);
        
        // Add Pointer Dot
        this.pointerDot = document.createElement('div');
        this.pointerDot.style.position = 'absolute';
        this.pointerDot.style.top = '0';
        this.pointerDot.style.left = '0';
        this.pointerDot.style.width = `${this.options.pointerSize}rem`;
        this.pointerDot.style.height = `${this.options.pointerSize}rem`;
        this.pointerDot.style.background = this.options.strokeColor;
        this.pointerDot.style.borderRadius = '50%';
        this.pointerDot.style.willChange = 'transform';
        this.pointerDot.style.pointerEvents = 'none'; // Don't block clicks
        this.container.appendChild(this.pointerDot);

        this.container.style.position = 'fixed'; // Fixed background
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.zIndex = '-1';
        this.container.style.overflow = 'hidden';
        this.container.style.backgroundColor = this.options.backgroundColor;
        
        // Initialize noise
        this.noise = createNoise2D();

        this.setSize();
        this.setLines();

        // Bind events
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });

        // Start loop
        this.tick();
    }

    setSize() {
        this.bounding = this.container.getBoundingClientRect();
        // SVG size matches container (100%)
    }

    setLines() {
        const { width, height } = this.bounding;
        this.lines = [];

        // Clear paths
        this.paths.forEach(p => p.remove());
        this.paths = [];

        const xGap = 20; // Increased gap for performance
        const yGap = 20;

        const oWidth = width + 200;
        const oHeight = height + 30;

        const totalLines = Math.ceil(oWidth / xGap);
        const totalPoints = Math.ceil(oHeight / yGap);

        const xStart = (width - xGap * totalLines) / 2;
        const yStart = (height - yGap * totalPoints) / 2;

        for (let i = 0; i < totalLines; i++) {
            const points = [];
            for (let j = 0; j < totalPoints; j++) {
                points.push({
                    x: xStart + xGap * i,
                    y: yStart + yGap * j,
                    wave: { x: 0, y: 0 },
                    cursor: { x: 0, y: 0, vx: 0, vy: 0 },
                });
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', this.options.strokeColor);
            path.setAttribute('stroke-width', '1');
            path.style.opacity = '0.5'; // Make lines a bit subtle
            
            this.svg.appendChild(path);
            this.paths.push(path);
            this.lines.push(points);
        }
    }

    onResize() {
        this.setSize();
        this.setLines();
    }

    onMouseMove(e) {
        this.updateMousePosition(e.pageX, e.pageY);
    }

    onTouchMove(e) {
        // e.preventDefault(); // Don't block scrolling
        const touch = e.touches[0];
        this.updateMousePosition(touch.clientX, touch.clientY);
    }

    updateMousePosition(x, y) {
        // Correct for scroll since container is fixed? 
        // If container is fixed, we want client coordinates, not page coordinates.
        // But the original code used pageX - bounding.left.
        // If container is fixed top 0 left 0, bounding left/top is 0.
        // So clientX/Y is correct.
        
        // Wait, original code: 
        // mouse.y = y - boundingRef.current.top + window.scrollY
        // If passed pageY, and container is absolute/fixed at top, this logic aligns it relative to container.
        
        // My container is fixed.
        // e.pageX includes scroll. e.clientX does not.
        
        // If I pass pageX/Y:
        // x = pageX - 0
        // y = pageY - 0 - scrollY (wait, why + scrollY in original?)
        
        // Let's stick to client coordinates for a fixed container.
        // But `e.pageX` is used in `onMouseMove`.
        
        // If container is fixed:
        // x relative to container = e.clientX
        // y relative to container = e.clientY
        
        this.mouse.x = x - window.scrollX; // Convert page to client if page passed
        this.mouse.y = y - window.scrollY;
        
        // Actually, let's just use client coordinates if possible.
        // onMouseMove gives clientX too.
        
        // Let's simplify: The wave effect should track the mouse on the screen.
        // If I scroll, the mouse stays relative to the viewport.
    }
    
    // Override onMouseMove to just use clientX/Y
    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        if (!this.mouse.set) {
            this.mouse.sx = this.mouse.x;
            this.mouse.sy = this.mouse.y;
            this.mouse.lx = this.mouse.x;
            this.mouse.ly = this.mouse.y;
            this.mouse.set = true;
        }
    }

    movePoints(time) {
        const noise = this.noise;
        if (!noise) return;

        this.lines.forEach(points => {
            points.forEach(p => {
                const move = noise(
                    (p.x + time * 0.0002) * 0.003, 
                    (p.y + time * 0.0001) * 0.002
                ) * 8; // Amplitude

                p.wave.x = Math.cos(move) * 12;
                p.wave.y = Math.sin(move) * 6;

                const dx = p.x - this.mouse.sx;
                const dy = p.y - this.mouse.sy;
                const d = Math.hypot(dx, dy);
                const l = Math.max(175, this.mouse.vs);

                if (d < l) {
                    const s = 1 - d / l;
                    const f = Math.cos(d * 0.001) * s;
                    
                    p.cursor.vx += Math.cos(this.mouse.a) * f * l * this.mouse.vs * 0.00035;
                    p.cursor.vy += Math.sin(this.mouse.a) * f * l * this.mouse.vs * 0.00035;
                }

                p.cursor.vx += (0 - p.cursor.x) * 0.01;
                p.cursor.vy += (0 - p.cursor.y) * 0.01;
                p.cursor.vx *= 0.95;
                p.cursor.vy *= 0.95;

                p.cursor.x += p.cursor.vx;
                p.cursor.y += p.cursor.vy;
            });
        });
    }

    moved(point, withCursorForce = true) {
        return {
            x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
            y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
        };
    }

    drawLines() {
        this.lines.forEach((points, lIndex) => {
            if (points.length < 2 || !this.paths[lIndex]) return;

            const firstPoint = this.moved(points[0], false);
            let d = `M ${firstPoint.x} ${firstPoint.y}`;

            for (let i = 1; i < points.length; i++) {
                const current = this.moved(points[i]);
                d += `L ${current.x} ${current.y}`;
            }

            this.paths[lIndex].setAttribute('d', d);
        });
    }

    tick() {
        const time = Date.now();
        
        // Smooth mouse
        this.mouse.sx += (this.mouse.x - this.mouse.sx) * 0.1;
        this.mouse.sy += (this.mouse.y - this.mouse.sy) * 0.1;

        const dx = this.mouse.x - this.mouse.lx;
        const dy = this.mouse.y - this.mouse.ly;
        const d = Math.hypot(dx, dy);

        this.mouse.v = d;
        this.mouse.vs += (d - this.mouse.vs) * 0.1;
        this.mouse.vs = Math.min(100, this.mouse.vs);

        this.mouse.lx = this.mouse.x;
        this.mouse.ly = this.mouse.y;
        this.mouse.a = Math.atan2(dy, dx);

        // Update dot position
        if (this.pointerDot) {
            this.pointerDot.style.transform = `translate3d(${this.mouse.sx}px, ${this.mouse.sy}px, 0) translate(-50%, -50%)`;
        }

        this.movePoints(time);
        this.drawLines();

        this.raf = requestAnimationFrame(() => this.tick());
    }
}

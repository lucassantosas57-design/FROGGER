import { Frog } from './entities/Frog.js';
import { Car }  from './entities/Car.js';

export class Game {
    constructor(canvas, uiHandlers) {
        this.canvas     = canvas;
        this.ctx        = canvas.getContext('2d');
        this.ui         = uiHandlers;

        this.gridSize   = 40;
        this.gameWidth  = canvas.width;   // 600
        this.gameHeight = canvas.height;  // 600

        this.frog  = new Frog(this.gameWidth, this.gameHeight, this.gridSize);
        this.cars  = [];

        this.state          = 'playing';
        this.lastTime       = 0;
        this.carSpawnTimer  = 0;
        this.spawnInterval  = 700; // ms

        this.score     = 0;
        this.bestScore = parseInt(localStorage.getItem('frogger_best') || '0', 10);

        // ─── LANE CONFIG ──────────────────────────────────────────
        // Row layout (gridSize = 40px each):
        //   Row  0  → SWAMP  (meta)
        //   Rows 1-3  → Road section A
        //   Row  4  → Grass divider
        //   Rows 5-8  → Road section B
        //   Row  9  → Grass divider
        //   Rows 10-12 → Road section C
        //   Rows 13-14 → Safe start zone
        // ─────────────────────────────────────────────────────────
        this.lanes = [
            { row: 12, dir:  1, speed: 2.0 },
            { row: 11, dir: -1, speed: 3.0 },
            { row: 10, dir:  1, speed: 1.5 },
            { row:  8, dir: -1, speed: 4.0 },
            { row:  7, dir:  1, speed: 2.5 },
            { row:  6, dir: -1, speed: 2.8 },
            { row:  5, dir:  1, speed: 3.5 },
            { row:  3, dir: -1, speed: 2.5 },
            { row:  2, dir:  1, speed: 5.0 },
            { row:  1, dir: -1, speed: 4.5 },
        ];

        // Pixel-art road colors
        this.COLOR = {
            road:       '#12121e',
            roadAlt:    '#0e0e18',
            grass:      '#0a2e12',
            grassDark:  '#071a0b',
            swamp:      '#052817',
            swampDark:  '#031408',
            start:      '#0f0f28',
            startAlt:   '#0c0c22',
            dashYellow: '#e8c000',
            dashWhite:  '#c8c8c8',
            lilyGreen:  '#16a34a',
            lilyLight:  '#4ade80',
            waterRipple:'#0b4d2e',
        };

        this.handleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.handleInput);
        this.loop = this.loop.bind(this);
    }

    // ─────────────────────────────────────────────────────────────
    //  RESET
    // ─────────────────────────────────────────────────────────────
    reset() {
        this.frog.reset();
        this.cars          = [];
        this.state         = 'playing';
        this.lastTime      = performance.now();
        this.carSpawnTimer = 0;
        this.score         = 0;
        this._updateHUD();
        requestAnimationFrame(this.loop);
    }

    // ─────────────────────────────────────────────────────────────
    //  INPUT
    // ─────────────────────────────────────────────────────────────
    handleInput(e) {
        if (this.state !== 'playing') return;

        const keyMap = {
            'ArrowUp': 'up',   'w': 'up',   'W': 'up',
            'ArrowDown': 'down','s': 'down', 'S': 'down',
            'ArrowLeft': 'left','a': 'left', 'A': 'left',
            'ArrowRight':'right','d': 'right','D': 'right',
        };

        if (keyMap[e.key]) {
            e.preventDefault();
            const prevY = this.frog.y;
            this.frog.move(keyMap[e.key]);

            // Score: +10 for each step forward (upward)
            if (keyMap[e.key] === 'up' && this.frog.y < prevY) {
                this.score += 10;
                this._updateHUD();
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  SPAWN
    // ─────────────────────────────────────────────────────────────
    spawnCars(dt) {
        this.carSpawnTimer += dt;
        if (this.carSpawnTimer > this.spawnInterval) {
            this.carSpawnTimer = 0;

            const lane  = this.lanes[Math.floor(Math.random() * this.lanes.length)];
            const speed = lane.speed + Math.random() * 1.5;
            this.cars.push(new Car(lane.row * this.gridSize, lane.dir, speed, this.gameWidth, this.gridSize));

            if (Math.random() > 0.4) {
                const lane2 = this.lanes[Math.floor(Math.random() * this.lanes.length)];
                if (lane2 !== lane) {
                    this.cars.push(new Car(lane2.row * this.gridSize, lane2.dir, lane2.speed, this.gameWidth, this.gridSize));
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  COLLISIONS
    // ─────────────────────────────────────────────────────────────
    checkCollisions() {
        const frogBox = {
            x: this.frog.x + 6,
            y: this.frog.y + 6,
            w: this.frog.width  - 12,
            h: this.frog.height - 12,
        };

        for (const car of this.cars) {
            if (frogBox.x < car.x + car.width  &&
                frogBox.x + frogBox.w > car.x  &&
                frogBox.y < car.y + car.height  &&
                frogBox.y + frogBox.h > car.y) {
                this.gameOver();
                return;
            }
        }

        if (this.frog.y === 0) this.win();
    }

    gameOver() {
        if (this.state !== 'playing') return;
        this.state        = 'lose';
        this.frog.isDead  = true;
        this._saveBest();
        this.ui.showLose();
    }

    win() {
        if (this.state !== 'playing') return;
        this.state  = 'win';
        this.score += 100;   // bonus for reaching swamp
        this._updateHUD();
        this._saveBest();
        this.ui.showWin();
    }

    // ─────────────────────────────────────────────────────────────
    //  UPDATE
    // ─────────────────────────────────────────────────────────────
    update(dt) {
        if (this.state !== 'playing') return;
        this.spawnCars(dt);
        for (let i = this.cars.length - 1; i >= 0; i--) {
            this.cars[i].update();
            if (this.cars[i].isOffscreen()) this.cars.splice(i, 1);
        }
        this.checkCollisions();
    }

    // ─────────────────────────────────────────────────────────────
    //  DRAW — 8-BIT PIXEL ART ROAD
    // ─────────────────────────────────────────────────────────────
    draw() {
        const ctx  = this.ctx;
        const G    = this.gridSize;   // 40
        const W    = this.gameWidth;  // 600
        const C    = this.COLOR;

        // ── Disable antialiasing for crisp pixel art ──────────────
        ctx.imageSmoothingEnabled = false;

        // ══════════════════════════════════════════════════════════
        //  1. START ZONE (rows 13-14, y = 520-600)
        // ══════════════════════════════════════════════════════════
        for (let row = 13; row <= 14; row++) {
            for (let col = 0; col < 15; col++) {
                ctx.fillStyle = (col + row) % 2 === 0 ? C.start : C.startAlt;
                ctx.fillRect(col * G, row * G, G, G);
            }
        }
        // "HOME" label in dim pixel font
        ctx.fillStyle = '#2a2a55';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('HOME', 4, this.gameHeight - 6);

        // ══════════════════════════════════════════════════════════
        //  2. ROAD SECTIONS  (rows 1-12, skipping 4 and 9)
        // ══════════════════════════════════════════════════════════
        const safeRows = new Set([0, 4, 9, 13, 14]);

        for (let row = 1; row <= 12; row++) {
            const y = row * G;

            if (safeRows.has(row)) continue; // handled separately

            // Alternating road shade for depth
            ctx.fillStyle = row % 2 === 0 ? C.road : C.roadAlt;
            ctx.fillRect(0, y, W, G);

            // Subtle horizontal pixel texture lines
            ctx.fillStyle = 'rgba(255,255,255,0.025)';
            for (let px = 4; px < G; px += 12) {
                ctx.fillRect(0, y + px, W, 2);
            }
        }

        // ── Yellow dashed lane dividers WITHIN each road section ──
        const laneDividerRows = [80, 120, 240, 280, 320, 440, 480];
        for (const dy of laneDividerRows) {
            ctx.fillStyle = C.dashYellow;
            for (let x = 0; x < W; x += 24) {
                ctx.fillRect(x, dy - 1, 12, 2);
            }
        }

        // ── White border lines at road section edges ──────────────
        const borderLines = [40, 160, 200, 360, 400, 520];
        for (const by of borderLines) {
            ctx.fillStyle = C.dashWhite;
            ctx.fillRect(0, by, W, 2);
        }

        // ══════════════════════════════════════════════════════════
        //  3. GRASS DIVIDERS (rows 4 and 9)
        // ══════════════════════════════════════════════════════════
        for (const grassRow of [4, 9]) {
            const gy = grassRow * G;

            // Base fill
            ctx.fillStyle = C.grass;
            ctx.fillRect(0, gy, W, G);

            // Pixel grass tufts texture
            ctx.fillStyle = C.grassDark;
            for (let x = 0; x < W; x += 16) {
                ctx.fillRect(x,     gy + 4,  6, 4);
                ctx.fillRect(x + 8, gy + 18, 6, 4);
                ctx.fillRect(x + 4, gy + 30, 6, 4);
            }

            // Bright accent dots (flowers / pixelated detail)
            ctx.fillStyle = '#fde68a';
            for (let x = 20; x < W; x += 80) {
                ctx.fillRect(x, gy + 8, 4, 4);
            }

            // Safe text
            ctx.fillStyle = '#0f4d1f';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('-- SAFE --', W / 2, gy + 26);
        }

        // ══════════════════════════════════════════════════════════
        //  4. SWAMP ZONE (row 0, y = 0-40)
        // ══════════════════════════════════════════════════════════
        ctx.fillStyle = C.swamp;
        ctx.fillRect(0, 0, W, G);

        // Water ripple pattern (horizontal pixel dashes)
        ctx.fillStyle = C.waterRipple;
        for (let x = 0; x < W; x += 28) {
            ctx.fillRect(x,      4,  18, 3);
            ctx.fillRect(x + 8,  14, 14, 3);
            ctx.fillRect(x + 4,  24, 16, 2);
        }

        // Pixel-art lily pads
        const lilyX = [30, 110, 195, 290, 380, 470, 550];
        for (const lx of lilyX) {
            this._drawLilyPad(ctx, lx, 20);
        }

        // ★ PÂNTANO ★ label
        ctx.fillStyle   = '#4ade80';
        ctx.font        = '8px "Press Start 2P", monospace';
        ctx.textAlign   = 'center';
        ctx.shadowColor  = '#00e84a';
        ctx.shadowBlur   = 6;
        ctx.fillText('★ PÂNTANO ★', W / 2, 29);
        ctx.shadowBlur   = 0;

        // ══════════════════════════════════════════════════════════
        //  5. ENTITIES (cars first, frog on top)
        // ══════════════════════════════════════════════════════════
        this.cars.forEach(car => car.draw(ctx));
        this.frog.draw(ctx);

        // ══════════════════════════════════════════════════════════
        //  6. PIXEL-ART BORDER FRAME on canvas edges
        // ══════════════════════════════════════════════════════════
        ctx.fillStyle = 'rgba(0,232,74,0.18)';
        ctx.fillRect(0,       0,       4,          this.gameHeight); // left
        ctx.fillRect(W - 4,   0,       4,          this.gameHeight); // right
        ctx.fillRect(0,       0,       W,          4);               // top
        ctx.fillRect(0,       this.gameHeight - 4, W, 4);            // bottom
    }

    // ─────────────────────────────────────────────────────────────
    //  HELPER: draw a single pixel-art lily pad at (cx, cy)
    // ─────────────────────────────────────────────────────────────
    _drawLilyPad(ctx, cx, cy) {
        const C = this.COLOR;
        // Outer pad (dark green)
        ctx.fillStyle = C.lilyGreen;
        ctx.fillRect(cx,      cy - 6,  10, 4);
        ctx.fillRect(cx - 4,  cy - 2,  18, 4);
        ctx.fillRect(cx - 6,  cy + 2,  22, 4);
        ctx.fillRect(cx - 4,  cy + 6,  18, 4);
        ctx.fillRect(cx,      cy + 10, 10, 4);

        // Inner highlight (light green)
        ctx.fillStyle = C.lilyLight;
        ctx.fillRect(cx + 2,  cy - 2,  6,  2);
        ctx.fillRect(cx,      cy + 2,  4,  2);
    }

    // ─────────────────────────────────────────────────────────────
    //  GAME LOOP
    // ─────────────────────────────────────────────────────────────
    loop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        if (this.state === 'playing') {
            requestAnimationFrame(this.loop);
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  UTILITIES
    // ─────────────────────────────────────────────────────────────
    _updateHUD() {
        const el = document.getElementById('scoreDisplay');
        if (el) el.textContent = String(this.score).padStart(6, '0');
    }

    _saveBest() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('frogger_best', String(this.bestScore));
        }
    }
}

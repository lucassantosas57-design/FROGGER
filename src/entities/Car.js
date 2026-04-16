export class Car {
    constructor(y, direction, speed, gameWidth, gridSize) {
        this.gridSize  = gridSize;
        this.width     = gridSize * 1.8;   // 72 px
        this.height    = gridSize - 10;    // 30 px
        this.y         = y + 5;
        this.direction = direction;        // 1 = right, -1 = left
        this.speed     = speed;
        this.gameWidth = gameWidth;

        if (this.direction === 1) {
            this.x = -this.width;
        } else {
            this.x = this.gameWidth;
        }

        // Varied retro color palette (flat, saturated — classic arcade)
        const palettes = [
            { body: '#dc2626', dark: '#7f1d1d', light: '#fca5a5' }, // red
            { body: '#2563eb', dark: '#1e3a8a', light: '#93c5fd' }, // blue
            { body: '#ca8a04', dark: '#713f12', light: '#fde68a' }, // yellow
            { body: '#9333ea', dark: '#3b0764', light: '#d8b4fe' }, // purple
            { body: '#0891b2', dark: '#164e63', light: '#7dd3fc' }, // cyan
            { body: '#16a34a', dark: '#14532d', light: '#86efac' }, // green (bonus)
        ];
        this.palette = palettes[Math.floor(Math.random() * palettes.length)];
    }

    update() {
        this.x += this.speed * this.direction;
    }

    // ─────────────────────────────────────────────────────────
    //  8-BIT PIXEL ART CAR SPRITE  (top-down view)
    //  Grid: 9 × 5 logical pixels
    //  Each pixel = 8 wide × 6 tall  (72 × 30 canvas px ✓)
    //
    //  Color key:
    //    '.' = transparent
    //    'C' = car body color
    //    'D' = darker body (door lines / underside)
    //    'W' = windshield / window
    //    'R' = roof highlight (lighter)
    //    'T' = tire (near-black)
    // ─────────────────────────────────────────────────────────
    draw(ctx) {
        const PW = 8; // pixel width in canvas px
        const PH = 6; // pixel height in canvas px

        // Sprite facing RIGHT (dir === 1, front = col 8 = right side)
        const spriteRight = [
            ['.','C','C','C','C','C','C','C','.'],  // row 0: roof outline
            ['C','C','R','R','R','C','W','W','C'],  // row 1: windshield at front-right
            ['C','D','C','C','C','C','C','D','C'],  // row 2: body + door lines
            ['C','C','C','C','C','C','C','C','C'],  // row 3: body
            ['.','T','.','.','.','.','.','T','.'],  // row 4: wheels
        ];

        // Sprite facing LEFT  (dir === -1, front = col 0 = left side)
        const spriteLeft = [
            ['.','C','C','C','C','C','C','C','.'],
            ['C','W','W','C','R','R','R','C','C'],
            ['C','D','C','C','C','C','C','D','C'],
            ['C','C','C','C','C','C','C','C','C'],
            ['.','T','.','.','.','.','.','T','.'],
        ];

        const sprite  = this.direction === 1 ? spriteRight : spriteLeft;
        const { body, dark, light } = this.palette;

        const palette = {
            '.': null,
            'C': body,
            'D': dark,
            'W': '#bfdbfe',   // window: icy blue tint
            'R': light,
            'T': '#111111',   // tire: near-black
        };

        ctx.save();
        // Disable antialiasing for crisp pixels
        ctx.imageSmoothingEnabled = false;

        for (let row = 0; row < sprite.length; row++) {
            for (let col = 0; col < sprite[row].length; col++) {
                const color = palette[sprite[row][col]];
                if (!color) continue;
                ctx.fillStyle = color;
                ctx.fillRect(
                    this.x  + col * PW,
                    this.y  + row * PH,
                    PW, PH
                );
            }
        }

        ctx.restore();
    }

    isOffscreen() {
        return this.direction === 1
            ? this.x > this.gameWidth
            : this.x + this.width < 0;
    }
}

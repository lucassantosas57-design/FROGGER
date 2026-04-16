export class Frog {
    constructor(gameWidth, gameHeight, gridSize) {
        this.gameWidth  = gameWidth;
        this.gameHeight = gameHeight;
        this.gridSize   = gridSize;
        this.reset();
    }

    reset() {
        this.width   = this.gridSize;
        this.height  = this.gridSize;
        this.x       = Math.floor(this.gameWidth / 2 / this.gridSize) * this.gridSize;
        this.y       = this.gameHeight - this.gridSize;
        this.isDead  = false;
        this.facing  = 'up'; // up | down | left | right
    }

    move(direction) {
        if (this.isDead) return;
        this.facing = direction;

        switch (direction) {
            case 'up':    if (this.y > 0)                          this.y -= this.gridSize; break;
            case 'down':  if (this.y < this.gameHeight - this.gridSize) this.y += this.gridSize; break;
            case 'left':  if (this.x > 0)                          this.x -= this.gridSize; break;
            case 'right': if (this.x < this.gameWidth - this.gridSize)  this.x += this.gridSize; break;
        }
    }

    // ─────────────────────────────────────────────────────────
    //  8-BIT PIXEL ART FROG SPRITE
    //  Grid: 8 × 8 logical pixels, each drawn at 5×5 canvas px
    //  (Frog occupies 40×40 → 8 × 5 = 40 ✓)
    //
    //  Color key:
    //    '.' = transparent
    //    'B' = dark green border/outline  #15803d
    //    'G' = main frog green            #22c55e
    //    'L' = highlight light green      #86efac
    //    'W' = eye white                  #ffffff
    //    'K' = pupil black                #000000
    // ─────────────────────────────────────────────────────────
    draw(ctx) {
        const P = 5; // pixel size in canvas units

        // Sprite facing UP (looking toward the swamp)
        const spriteUp = [
            ['.','B','.','.','.','.','B','.'],  // eye-stalks row 1
            ['.','B','.','.','.','.','B','.'],  // eye-stalks row 2
            ['B','W','B','.','.','B','W','B'],  // white eyes
            ['B','K','B','G','G','B','K','B'],  // pupils + head
            ['B','G','G','G','G','G','G','B'],  // upper body
            ['G','G','L','G','G','L','G','G'],  // body + highlights
            ['B','.','B','G','G','B','.','B'],  // legs gap
            ['.','.','.','.','.','.','.','.',],  // ground (transparent)
        ];

        // Sprite facing DOWN (180° flip)
        const spriteDown = [
            ['.','.','.','.','.','.','.','.',],
            ['B','.','B','G','G','B','.','B'],
            ['G','G','L','G','G','L','G','G'],
            ['B','G','G','G','G','G','G','B'],
            ['B','K','B','G','G','B','K','B'],
            ['B','W','B','.','.','B','W','B'],
            ['.','B','.','.','.','.','B','.'],
            ['.','B','.','.','.','.','B','.'],
        ];

        // Sprite facing LEFT (rotated)
        const spriteLeft = [
            ['.','B','B','B','B','B','.','.'],
            ['B','W','G','G','G','G','B','.'],
            ['B','K','G','G','G','G','G','B'],
            ['B','G','L','G','G','G','G','B'],
            ['B','G','G','G','G','G','G','B'],
            ['B','K','G','G','G','G','G','B'],
            ['B','W','G','G','G','G','B','.'],
            ['.','B','B','B','B','B','.','.'],
        ];

        // Sprite facing RIGHT (rotated)
        const spriteRight = [
            ['.','.','B','B','B','B','B','.'],
            ['.','B','G','G','G','G','W','B'],
            ['B','G','G','G','G','G','K','B'],
            ['B','G','G','G','G','L','G','B'],
            ['B','G','G','G','G','G','G','B'],
            ['B','G','G','G','G','G','K','B'],
            ['.','B','G','G','G','G','W','B'],
            ['.','.','B','B','B','B','B','.'],
        ];

        const sprites = { up: spriteUp, down: spriteDown, left: spriteLeft, right: spriteRight };
        const sprite  = sprites[this.facing] || spriteUp;

        const palette = {
            '.': null,
            'B': this.isDead ? '#7f1d1d' : '#15803d',
            'G': this.isDead ? '#ef4444' : '#22c55e',
            'L': this.isDead ? '#fca5a5' : '#86efac',
            'W': '#ffffff',
            'K': '#000000',
        };

        for (let row = 0; row < sprite.length; row++) {
            for (let col = 0; col < sprite[row].length; col++) {
                const colorKey = sprite[row][col];
                const color    = palette[colorKey];
                if (!color) continue;
                ctx.fillStyle = color;
                ctx.fillRect(
                    this.x + col * P,
                    this.y + row * P,
                    P, P
                );
            }
        }
    }
}

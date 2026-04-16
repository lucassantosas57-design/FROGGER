export class Frog {
    constructor(gameWidth, gameHeight, gridSize) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        this.width = this.gridSize;
        this.height = this.gridSize;
        // Centralizado horizontalmente no final da tela
        this.x = Math.floor(this.gameWidth / 2 / this.gridSize) * this.gridSize;
        this.y = this.gameHeight - this.gridSize;
        this.color = '#22c55e'; // Verde claro para destacar
        this.isDead = false;
    }

    move(direction) {
        if (this.isDead) return;

        switch (direction) {
            case 'up':
                if (this.y > 0) this.y -= this.gridSize;
                break;
            case 'down':
                if (this.y < this.gameHeight - this.gridSize) this.y += this.gridSize;
                break;
            case 'left':
                if (this.x > 0) this.x -= this.gridSize;
                break;
            case 'right':
                if (this.x < this.gameWidth - this.gridSize) this.x += this.gridSize;
                break;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        // Corpo arredondado para parecerr mais amigável e premium
        ctx.beginPath();
        ctx.roundRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4, 8);
        ctx.fill();
        
        // Olhos (brancos)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 10, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 30, this.y + 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas (pretas)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 8, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 30, this.y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

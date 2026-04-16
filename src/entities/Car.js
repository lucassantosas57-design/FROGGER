export class Car {
    constructor(y, direction, speed, gameWidth, gridSize) {
        this.gridSize = gridSize;
        this.width = gridSize * 1.8; // Carros quase ocupam 2 grids
        this.height = gridSize - 10;
        this.y = y + 5; // Centraliza o carro no bloco de grid
        this.direction = direction; // 1 (direita) ou -1 (esquerda)
        this.speed = speed;
        this.gameWidth = gameWidth;
        
        // Configura x baseado de qual lado vai surgir
        if (this.direction === 1) {
            this.x = -this.width;
        } else {
            this.x = this.gameWidth;
        }

        // Variedade premium de cores para os veículos
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6', '#0ea5e9'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speed * this.direction;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 6);
        ctx.fill();

        // Detalhes da janela do carro baseada na direção que anda
        ctx.fillStyle = '#1e293b'; // Mesma cor do background da tela
        if (this.direction === 1) {
            ctx.fillRect(this.x + this.width - 15, this.y + 3, 8, this.height - 6);
        } else {
            ctx.fillRect(this.x + 7, this.y + 3, 8, this.height - 6);
        }
    }

    // Identificar saída de tela para descartar memória do objeto
    isOffscreen() {
        if (this.direction === 1) {
            return this.x > this.gameWidth; // Saiu pela direita
        } else {
            return this.x + this.width < 0;   // Saiu pela esquerda
        }
    }
}

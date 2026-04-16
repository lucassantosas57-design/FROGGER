import { Frog } from './entities/Frog.js';
import { Car } from './entities/Car.js';

export class Game {
    constructor(canvas, uiHandlers) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = uiHandlers;
        
        this.gridSize = 40;
        this.gameWidth = canvas.width;  // 600
        this.gameHeight = canvas.height; // 600

        this.frog = new Frog(this.gameWidth, this.gameHeight, this.gridSize);
        this.cars = [];
        
        this.state = 'playing'; // playing | win | lose
        this.lastTime = 0;
        this.carSpawnTimer = 0;
        this.spawnInterval = 700; // ms

        // Mapeamento das "Linhas" da estada. 14 Linhas possíveis. 0 é Pântano. 14 é Safe Inicial.
        // Row = linha do grid; Dir = Direção do carro (1, -1); Speed = Velocidade Base.
        this.lanes = [
            { row: 12, dir: 1, speed: 2 },
            { row: 11, dir: -1, speed: 3 },
            { row: 10, dir: 1, speed: 1.5 },
            { row: 8, dir: -1, speed: 4 },
            { row: 7, dir: 1, speed: 2.5 },
            { row: 6, dir: -1, speed: 2.8 },
            { row: 5, dir: 1, speed: 3.5 },
            { row: 3, dir: -1, speed: 2.5 },
            { row: 2, dir: 1, speed: 5 },
            { row: 1, dir: -1, speed: 4.5 },
        ];

        this.handleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.handleInput);
        
        this.loop = this.loop.bind(this);
    }

    reset() {
        this.frog.reset();
        this.cars = [];
        this.state = 'playing';
        this.lastTime = performance.now();
        this.carSpawnTimer = 0;
        requestAnimationFrame(this.loop);
    }

    handleInput(e) {
        if (this.state !== 'playing') return;
        
        const keyMap = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right'
        };

        if (keyMap[e.key]) {
            e.preventDefault(); // Impede scroll indesejado ao pressionar setas
            this.frog.move(keyMap[e.key]);
        }
    }

    spawnCars(dt) {
        this.carSpawnTimer += dt;
        if (this.carSpawnTimer > this.spawnInterval) {
            this.carSpawnTimer = 0;
            
            // Escolhe de forma pseudo-aleatória onde dar spawn do carro
            const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
            const y = lane.row * this.gridSize;
            
            // Dinamismo: Velocidade base + variação
            const speed = lane.speed + (Math.random() * 1.5);
            
            this.cars.push(new Car(y, lane.dir, speed, this.gameWidth, this.gridSize));

            // Múltiplos spawns simultâneos as vezes para escalar dificuldade
            if (Math.random() > 0.4) {
                const lane2 = this.lanes[Math.floor(Math.random() * this.lanes.length)];
                if (lane2 !== lane) {
                     this.cars.push(new Car(lane2.row * this.gridSize, lane2.dir, lane2.speed, this.gameWidth, this.gridSize));
                }
            }
        }
    }

    checkCollisions() {
        // Reduzindo o colider do sapo em 10px para uma gameplay justa e evitar edge-cases punitivos
        const frogBox = {
            x: this.frog.x + 5,
            y: this.frog.y + 5,
            w: this.frog.width - 10,
            h: this.frog.height - 10
        };

        for (let car of this.cars) {
            const carBox = {
                x: car.x,
                y: car.y,
                w: car.width,
                h: car.height
            };

            // Intersecção AABB clássica
            if (frogBox.x < carBox.x + carBox.w &&
                frogBox.x + frogBox.w > carBox.x &&
                frogBox.y < carBox.y + carBox.h &&
                frogBox.y + frogBox.h > carBox.y) {
                
                this.gameOver();
                return;
            }
        }

        // Meta atingida (Linha 0 representa o fim do trajeto de 600px do grid)
        if (this.frog.y === 0) {
            this.win();
        }
    }

    gameOver() {
        if (this.state === 'playing') {
            this.state = 'lose';
            this.frog.isDead = true;
            this.ui.showLose();
        }
    }

    win() {
        if (this.state === 'playing') {
            this.state = 'win';
            this.ui.showWin();
        }
    }

    update(dt) {
        if (this.state !== 'playing') return;

        this.spawnCars(dt);

        for (let i = this.cars.length - 1; i >= 0; i--) {
            this.cars[i].update();
            if (this.cars[i].isOffscreen()) {
                this.cars.splice(i, 1);
            }
        }

        this.checkCollisions();
    }

    draw() {
        // Limpar o Background do Frame Anterior
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);

        // Renderizar a área de Objetivo (Pântano Superior)
        this.ctx.fillStyle = '#064e3b';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gridSize);
        this.ctx.fillStyle = '#10b981';
        this.ctx.font = '700 20px Outfit';
        this.ctx.fillText('P Â N T A N O', this.gameWidth / 2 - 70, 28);

        // Renderizar a área Segura de Saída (Inferior)
        this.ctx.fillStyle = '#1e293b'; 
        this.ctx.fillRect(0, this.gameHeight - this.gridSize, this.gameWidth, this.gridSize);
        this.ctx.fillStyle = '#334155';
        this.ctx.font = '400 14px Outfit';
        this.ctx.fillText('INÍCIO SEGURO', this.gameWidth / 2 - 50, this.gameHeight - 14);
        
        // Renderizar Detalhes das Faixas (Estética)
        this.ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let i = 1; i < 14; i++) {
            if (i % 2 === 0) { // Alternar cor das calçadas
                this.ctx.fillRect(0, i * this.gridSize, this.gameWidth, this.gridSize);
            }
        }

        // Renderizar as Entidades em ordem Z
        this.cars.forEach(car => car.draw(this.ctx));
        this.frog.draw(this.ctx);
    }

    loop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        if (this.state === 'playing') {
            requestAnimationFrame(this.loop);
        }
    }
}

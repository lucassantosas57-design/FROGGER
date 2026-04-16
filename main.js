import './style.css'
import { Game } from './src/Game.js'

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const overlay = document.getElementById('uiOverlay');
    const title = document.getElementById('uiTitle');
    const message = document.getElementById('uiMessage');
    const restartBtn = document.getElementById('restartBtn');

    const uiHandlers = {
        showWin: () => {
            overlay.classList.remove('hidden');
            overlay.classList.remove('lose');
            overlay.classList.add('win');
            title.textContent = 'Vitória!';
            message.textContent = 'Você cruzou o pântano!';
        },
        showLose: () => {
            overlay.classList.remove('hidden');
            overlay.classList.remove('win');
            overlay.classList.add('lose');
            title.textContent = 'Game Over';
            message.textContent = 'Um carro te esmagou.';
        },
        hide: () => {
            overlay.classList.add('hidden');
        }
    };

    const game = new Game(canvas, uiHandlers);
    
    restartBtn.addEventListener('click', () => {
        uiHandlers.hide();
        game.reset();
    });

    // Setup inicial focado e iniciado
    uiHandlers.hide();
    game.reset();
});

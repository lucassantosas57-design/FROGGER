import './style.css';
import { Game } from './src/Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas     = document.getElementById('gameCanvas');
    const overlay    = document.getElementById('uiOverlay');
    const title      = document.getElementById('uiTitle');
    const message    = document.getElementById('uiMessage');
    const restartBtn = document.getElementById('restartBtn');

    const uiHandlers = {
        showWin: () => {
            overlay.classList.remove('hidden', 'lose');
            overlay.classList.add('win');
            title.textContent   = '★ VITÓRIA! ★';
            message.textContent = 'VOCÊ CRUZOU O PÂNTANO!';
        },
        showLose: () => {
            overlay.classList.remove('hidden', 'win');
            overlay.classList.add('lose');
            title.textContent   = 'GAME OVER';
            message.textContent = 'UM CARRO TE ESMAGOU...';
        },
        hide: () => {
            overlay.classList.add('hidden');
            overlay.classList.remove('win', 'lose');
        },
    };

    const game = new Game(canvas, uiHandlers);

    restartBtn.addEventListener('click', () => {
        uiHandlers.hide();
        game.reset();
    });

    // Garantir que a fonte Press Start 2P esteja carregada
    // antes de iniciar o jogo (necessário para canvas font rendering)
    document.fonts.load('8px "Press Start 2P"').then(() => {
        uiHandlers.hide();
        game.reset();
    }).catch(() => {
        // Fallback se offline — inicia mesmo sem a fonte
        uiHandlers.hide();
        game.reset();
    });
});

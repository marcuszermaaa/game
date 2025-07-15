// js/minigame.js - Gerencia a lógica E a página do minigame de tatuagem.

// --- IMPORTS ---
import { SIGILS } from '../js/data/sigilData.js';
import { IS_TOUCH_DEVICE } from './constants.js';

/**
 * Classe principal que gerencia a lógica do minigame de tatuagem.
 */
class TattooMinigame {
    constructor(canvas, sigil, gameState, onComplete) {
        this.canvas = canvas;
        if (!this.canvas) {
            if (onComplete) onComplete({ success: false, accuracy: 0 });
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.sigil = sigil;
        this.gameState = gameState;
        this.onComplete = onComplete;
        
        this.targetNodes = this.sigil.nodes.map(node => ({ ...node, hit: false }));
        this.nextNodeIndex = 0;
        this.isDrawing = false;
        this.currentPath = [];
        this.listenersInitialized = false;

        this.init();
    }

    init() {
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();

        if (IS_TOUCH_DEVICE) {
            this.startTouchGame();
        } else {
            this.startDragGame();
        }
        this.draw();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (!parent) return;
        const parentWidth = parent.clientWidth;
        if (parentWidth <= 0) return;

        this.canvas.width = parentWidth * 0.9;
        this.canvas.height = this.canvas.width / (760 / 420);
        this.draw();
    }

    startDragGame() {
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
        this.listenersInitialized = true;
    }

    startTouchGame() {
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.canvas.addEventListener('click', this.handleCanvasClick);
        this.listenersInitialized = true;
    }

    finish(success) {
        window.removeEventListener('resize', this.resize);
        if (this.listenersInitialized) {
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            document.removeEventListener('mouseup', this.handleMouseUp);
            document.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('click', this.handleCanvasClick);
        }
        if (this.onComplete) this.onComplete({ success: success, accuracy: success ? 1 : 0 });
    }

    // <<< FUNÇÃO 'draw' RESTAURADA COM LÓGICA COMPLETA >>>
    draw() {
        if (!this.ctx) return;

        const getX = (coord) => coord * this.canvas.width;
        const getY = (coord) => coord * this.canvas.height;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenha o caminho traçado pelo jogador
        if (this.currentPath.length > 1) {
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(getX(this.currentPath[0].x), getY(this.currentPath[0].y));
            for (let i = 1; i < this.currentPath.length; i++) {
                this.ctx.lineTo(getX(this.currentPath[i].x), getY(this.currentPath[i].y));
            }
            this.ctx.stroke();
        }

        // --- ESTA PARTE ESTAVA FALTANDO NO EXEMPLO ANTERIOR ---
        // Desenha cada nó de destino do sigilo
        this.targetNodes.forEach((node, index) => {
            const nodeX = getX(node.x);
            const nodeY = getY(node.y);
            const nodeRadius = Math.min(this.canvas.width, this.canvas.height) * 0.025;

            this.ctx.beginPath();
            this.ctx.arc(nodeX, nodeY, nodeRadius, 0, 2 * Math.PI);
            this.ctx.fillStyle = node.hit ? '#5d995f' : 'rgba(164, 161, 145, 0.5)';
            this.ctx.fill();

            if (index === this.nextNodeIndex) {
                this.ctx.strokeStyle = '#a4a191';
                this.ctx.lineWidth = 3;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#a4a191';
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }

            this.ctx.font = `bold ${nodeRadius * 1.2}px 'Special Elite', cursive`;
            this.ctx.fillStyle = "#1a1a1a";
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(index + 1, nodeX, nodeY);
        });
        // --- FIM DA PARTE QUE FALTAVA ---
    }

    // <<< FUNÇÃO 'getMousePos' RESTAURADA COM LÓGICA COMPLETA >>>
    getMousePos(evt) {
        if (!this.canvas) return { x: 0, y: 0 };
        
        const rect = this.canvas.getBoundingClientRect();
        const clientX = evt.clientX || (evt.touches && evt.touches[0] && evt.touches[0].clientX);
        const clientY = evt.clientY || (evt.touches && evt.touches[0] && evt.touches[0].clientY);

        let x = (clientX - rect.left) / this.canvas.width;
        let y = (clientY - rect.top) / this.canvas.height;

        // A lógica de "shake" (tremedeira) também está restaurada
        const shakeMagnitude = ((100 - (this.gameState?.sanity || 100)) / 2000) * (this.gameState?.shakeMultiplier || 1);
        if (shakeMagnitude > 0 && this.isDrawing) {
            x += (Math.random() - 0.5) * shakeMagnitude;
            y += (Math.random() - 0.5) * shakeMagnitude;
        }

        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));

        return { x, y };
    }

    handleMouseDown(e) {
        if (this.nextNodeIndex !== 0) return;
        const pos = this.getMousePos(e);
        const firstNode = this.targetNodes[0];
        const dx = pos.x - firstNode.x;
        const dy = pos.y - firstNode.y;
        const clickTolerance = 0.07;
        if (Math.sqrt(dx * dx + dy * dy) < clickTolerance) {
            this.isDrawing = true;
            this.currentPath = [pos];
            firstNode.hit = true;
            this.nextNodeIndex = 1;
            this.draw();
        }
    }

    handleMouseUp() {
        if (!this.isDrawing) return;
        this.finish(this.nextNodeIndex === this.targetNodes.length);
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;
        const pos = this.getMousePos(e);
        this.currentPath.push(pos);
        if (this.nextNodeIndex < this.targetNodes.length) {
            const nextNode = this.targetNodes[this.nextNodeIndex];
            const dx = pos.x - nextNode.x;
            const dy = pos.y - nextNode.y;
            const hitTolerance = 0.05;
            if (Math.sqrt(dx * dx + dy * dy) < hitTolerance) {
                nextNode.hit = true;
                this.nextNodeIndex++;
            }
        }
        this.draw();
    }

    handleCanvasClick(e) {
        if (this.nextNodeIndex === this.targetNodes.length) {
            this.finish(true);
            return;
        }
        const pos = this.getMousePos(e);
        const nextNode = this.targetNodes[this.nextNodeIndex];
        const dx = pos.x - nextNode.x;
        const dy = pos.y - nextNode.y;
        const clickTolerance = 0.06;
        if (Math.sqrt(dx * dx + dy * dy) < clickTolerance) {
            nextNode.hit = true;
            this.nextNodeIndex++;
            if (this.nextNodeIndex === this.targetNodes.length) {
                this.finish(true);
            }
            this.draw();
        } else {
            this.finish(false);
        }
    }
}

// --- BLOCO DE INICIALIZAÇÃO AUTOMÁTICA ---
document.addEventListener('DOMContentLoaded', () => {
    let gameState = JSON.parse(localStorage.getItem('gameState'));
    const urlParams = new URLSearchParams(window.location.search);
    const sigilId = urlParams.get('sigil');

    if (!gameState || !sigilId || !SIGILS[sigilId]) {
        console.error("Erro: Estado do jogo ou ID do sigilo inválido.", { gameState, sigilId });
        alert("Erro ao carregar dados para o minigame.");
        window.location.href = '/game.html';
        return;
    }

    const sigil = SIGILS[sigilId];
    const canvas = document.getElementById('tattoo-canvas');
    const instructionsEl = document.getElementById('minigame-instructions');

    if (instructionsEl) {
        const instructions = IS_TOUCH_DEVICE
            ? "Toque nos nós na ordem correta, sem errar."
            : "Clique no nó '1' e arraste para conectar todos os outros em ordem.";
        instructionsEl.textContent = instructions;
    }

    new TattooMinigame(canvas, sigil, gameState, (result) => {
        gameState.lastOutcomeData = {
            success: result.success,
            accuracy: result.accuracy
        };
        localStorage.setItem('gameState', JSON.stringify(gameState));
        window.location.href = '/game.html';
    });
});
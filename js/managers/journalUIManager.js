// js/managers/journalUIManager.js - AGORA COM LÓGICA DE ANIMAÇÃO

/**
 * Gera o código HTML para desenhar um sigilo ESTÁTICO com base em seus nós.
 * @param {Array<{x: number, y: number}>} nodes - Um array de coordenadas.
 * @returns {string} O código HTML para o desenho do sigilo.
 */
export function generateSigilDrawing(nodes) {
    if (!nodes || nodes.length === 0) {
        return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2em;color:#555;">?</div>';
    }
    
    let html = '';
    for (let i = 0; i < nodes.length - 1; i++) {
        const node = nodes[i];
        const nextNode = nodes[i + 1];
        const dx = (nextNode.x - node.x) * 100;
        const dy = (nextNode.y - node.y) * 100;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        html += `<div class="sigil-line" style="left: ${node.x * 100}%; top: ${node.y * 100}%; width: ${length}%; transform: rotate(${angle}deg);"></div>`;
    }

    nodes.forEach((node) => {
        html += `<div class="sigil-node" style="left: ${node.x * 100}%; top: ${node.y * 100}%;"></div>`;
    });
    
    return html;
}

/**
 * ✨ NOVA CLASSE: SigilAnimator ✨
 * Controla a animação de um sigilo em um elemento <canvas>.
 * Adaptada do seu exemplo para se integrar ao jogo.
 */
export class SigilAnimator {
    constructor(canvas, sigilData) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Adapta a estrutura de dados do sigilo para um simples array de nós
        this.nodes = [sigilData.startNode, ...sigilData.segments.map(s => s.end)];
        
        this.isAnimating = false;
        this.currentSegmentIndex = 0;
        this.segmentProgress = 0;
        this.animationFrameId = null;
        this.lastTime = 0;
        this.ANIMATION_SPEED = 0.8; // Menor = mais rápido

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mouseover', () => this.start());
        this.canvas.addEventListener('mouseout', () => this.stop());
        
        this.drawStaticState();
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.draw();
    }

    start() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentSegmentIndex = 0;
        this.segmentProgress = 0;
        this.lastTime = performance.now();
        this.animate();
    }

    stop() {
        this.isAnimating = false;
        cancelAnimationFrame(this.animationFrameId);
        this.drawStaticState();
    }

    animate(currentTime = performance.now()) {
        if (!this.isAnimating) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        const startNode = this.nodes[this.currentSegmentIndex];
        const endNode = this.nodes[this.currentSegmentIndex + 1];

        const segmentDx = endNode.x - startNode.x;
        const segmentDy = endNode.y - startNode.y;
        const segmentLength = Math.sqrt(segmentDx*segmentDx + segmentDy*segmentDy);
        
        this.segmentProgress += (deltaTime / (segmentLength * this.ANIMATION_SPEED));

        if (this.segmentProgress >= 1.0) {
            this.segmentProgress = 1.0;
            this.draw();
            this.currentSegmentIndex++;
            this.segmentProgress = 0;
            if (this.currentSegmentIndex >= this.nodes.length - 1) {
                this.isAnimating = false;
            }
        }
        
        this.draw();

        if (this.isAnimating) {
            this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        }
    }
    
    drawStaticState() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const getX = (coord) => coord * this.canvas.width;
        const getY = (coord) => coord * this.canvas.height;

        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(getX(node.x), getY(node.y), 5, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'rgba(100, 95, 80, 0.5)';
            this.ctx.fill();
        });
    }

    draw() {
        this.drawStaticState();
        const getX = (coord) => coord * this.canvas.width;
        const getY = (coord) => coord * this.canvas.height;
        
        for (let i = 0; i < this.currentSegmentIndex; i++) {
            const start = this.nodes[i];
            const end = this.nodes[i+1];
            this.ctx.strokeStyle = '#16a085';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(getX(start.x), getY(start.y));
            this.ctx.lineTo(getX(end.x), getY(end.y));
            this.ctx.stroke();
        }

        if (this.isAnimating && this.currentSegmentIndex < this.nodes.length - 1) {
            const startNode = this.nodes[this.currentSegmentIndex];
            const endNode = this.nodes[this.currentSegmentIndex + 1];
            
            const currentX = getX(startNode.x) + (getX(endNode.x) - getX(startNode.x)) * this.segmentProgress;
            const currentY = getY(startNode.y) + (getY(endNode.y) - getY(startNode.y)) * this.segmentProgress;
            
            this.ctx.strokeStyle = '#2ecc71';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(getX(startNode.x), getY(startNode.y));
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.shadowColor = '#f1c40f';
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }
}
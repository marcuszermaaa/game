// js/minigame.js - VERSÃO COMPLETA COM LIMITE DE ERROS E DELAY FINAL

import { SIGILS } from './data/sigilData.js';

class MasterMinigame {
    constructor(canvas, sigil, gameState, onComplete) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sigil = sigil;
        this.gameState = gameState;
        this.onComplete = onComplete;
        
        this.referenceCanvas = document.getElementById('sigil-reference-canvas');
        this.referenceCtx = this.referenceCanvas ? this.referenceCanvas.getContext('2d') : null;

        this.commentBox = document.getElementById('client-comment-box');
        this.toolsDisplay = document.getElementById('active-tools-display');

        this.tools = {
            decalque: this.gameState.purchasedUpgrades.has('decalque_arcano'),
            luminaria: this.gameState.purchasedUpgrades.has('luminaria_da_alma'),
            munhequeira: this.gameState.purchasedUpgrades.has('brace'),
        };

        this.isBloodTattoo = this.gameState.bloodTattooActive || false;
        this.activeSpecialInk = this.gameState.specialInkActive || null;

        if (this.gameState.bloodTattooActive) delete this.gameState.bloodTattooActive;
        if (this.gameState.specialInkActive) delete this.gameState.specialInkActive;
        
        this.mousePos = { x: -100, y: -100 };
        this.nodes = [this.sigil.startNode, ...this.sigil.segments.map(s => s.end)];
        this.minigameState = 'IDLE';
        this.currentSegmentIndex = 0;
        this.lockedSegments = [];
        this.tempControlPoint = null;
        this.isShaking = false;
        this.shakeIntensity = 10;
        this.bleedParticles = [];
        this.painEventsTriggered = 0;
        
        // ✨ NOVO: Contador para erros graves que encerram o minigame
        this.errorCount = 0; 

        this.totalErrorScore = 0;
        this.lastErrorTime = 0; // Para o efeito de flash

        this.gameState.recargasBorrifador = this.gameState.recargasBorrifador || 0;

        this.init();
    }

    init() {
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);

        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
        
        this.renderToolsHUD();
        this.drawSigilReference();
        this.startAnimationLoop();
    }

    drawSigilReference() {
        if (!this.referenceCtx) return;
        const canvas = this.referenceCanvas;
        const ctx = this.referenceCtx;
        const w = canvas.width;
        const h = canvas.height;
        const getX = (coord) => coord * w;
        const getY = (coord) => coord * h;
        ctx.fillStyle = '#f5eeda';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        this.sigil.segments.forEach((seg, index) => {
            const startNode = this.nodes[index];
            ctx.beginPath();
            ctx.moveTo(getX(startNode.x), getY(startNode.y));
            if (seg.type === 'curve') {
                ctx.quadraticCurveTo(getX(seg.control.x), getY(seg.control.y), getX(seg.end.x), getY(seg.end.y));
            } else {
                ctx.lineTo(getX(seg.end.x), getY(seg.end.y));
            }
            ctx.stroke();
        });
        ctx.fillStyle = '#5c5c5c';
        this.nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(getX(node.x), getY(node.y), 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // ✨ FUNÇÃO ATUALIZADA ✨
    finish(success) {
        // Previne que a função seja chamada múltiplas vezes
        if (this.minigameState === 'FINISHED') return;
        this.minigameState = 'FINISHED';

        console.log(`Minigame finalizado com ${success ? 'SUCESSO' : 'FALHA'}. Pontuação de erro: ${this.totalErrorScore}`);
        
        // Remove todos os listeners para travar a tela
        window.removeEventListener('resize', this.resize);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);

        // Mostra a mensagem final na tela do minigame
        if (success) {
            this.showClientComment("Perfeito... está exatamente como deveria ser. Sinto a energia fluindo.");
        } else {
            this.showClientComment("Não! Está tudo errado! O que você fez?!");
        }

        // Espera 3 segundos antes de redirecionar
        setTimeout(() => {
            if (this.onComplete) {
                let method = 'normal';
                if (this.isBloodTattoo) method = 'blood';
                else if (this.activeSpecialInk) method = this.activeSpecialInk;
                
                // Envia todos os dados para a próxima tela
                this.onComplete({ success: success, painEvents: this.painEventsTriggered, method: method, accuracy: this.totalErrorScore });
            }
        }, 3000); // Atraso de 3000 milissegundos (3 segundos)
    }

    startAnimationLoop() {
        const animate = () => {
            this.update();
            this.draw();
            requestAnimationFrame(animate);
        };
        animate();
    }

    triggerPainEvent(segment) {
        if (this.gameState.purchasedUpgrades.has('borrifador_base') && this.gameState.recargasBorrifador > 0) {
            this.gameState.recargasBorrifador--; 
            this.renderToolsHUD(); 
            this.showClientComment("Ufa... essa foi por pouco. O borrifador ajudou.");
            return;
        }
        this.painEventsTriggered++;
        if (this.isBloodTattoo) {
            this.shakeIntensity = 25;
            this.showClientComment("O SANGUE! QUEIMA! QUEIMA COMO O PRÓPRIO ABISSO!");
        } else {
            this.shakeIntensity = 10;
            this.showClientComment(segment.dialogue);
        }
        this.isShaking = true;
        setTimeout(() => { this.isShaking = false; }, this.isBloodTattoo ? 1200 : 700);
        this.createBleedEffect(this.nodes[this.currentSegmentIndex + 1]);
    }

    showClientComment(text) {
        if (this.commentBox) {
            this.commentBox.textContent = text;
            this.commentBox.classList.add('visible');
            setTimeout(() => { this.commentBox.classList.remove('visible'); }, 2800); // Um pouco menos que o delay final
        }
    }

    showErrorFeedback(message) {
        this.showClientComment(message);
        this.lastErrorTime = performance.now();
    }

    renderToolsHUD() {
        if (!this.toolsDisplay) return;
        this.toolsDisplay.innerHTML = '<h3>Ferramentas Ativas</h3>';
        if (this.tools.decalque) { this.toolsDisplay.innerHTML += `<div class="tool-item active"><h4>Decalque Arcano</h4><p>Mostrando o caminho...</p></div>`; }
        if (this.tools.luminaria) { this.toolsDisplay.innerHTML += `<div class="tool-item active"><h4>Luminária da Alma</h4><p>Revelando os pontos...</p></div>`; }
        if (this.tools.munhequeira) { this.toolsDisplay.innerHTML += `<div class="tool-item active"><h4>Munhequeira de Firmeza</h4><p>Reduzindo o tremor.</p></div>`; }
        if (this.gameState.purchasedUpgrades.has('borrifador_base')) {
            const recargas = this.gameState.recargasBorrifador || 0;
            this.toolsDisplay.innerHTML += `<div class="tool-item ${recargas > 0 ? 'active' : 'used'}"><h4>Borrifador de Lótus</h4><p>Recargas: ${recargas}</p></div>`;
        }
    }

    createBleedEffect(node) {
        const pos = { x: node.x * this.canvas.width, y: node.y * this.canvas.height };
        for (let i = 0; i < 20; i++) {
            this.bleedParticles.push({
                x: pos.x, y: pos.y, radius: Math.random() * 2 + 1, maxRadius: Math.random() * 6 + 6,
                opacity: 1, life: 1.0, velocity: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 }
            });
        }
    }

    update() {
        for (let i = this.bleedParticles.length - 1; i >= 0; i--) {
            const p = this.bleedParticles[i];
            p.life -= 0.008;
            if (p.life <= 0) { this.bleedParticles.splice(i, 1); continue; }
            p.x += p.velocity.x; p.y += p.velocity.y; p.radius = Math.min(p.maxRadius, p.radius + 0.1); p.opacity = p.life;
        }
    }
    
    draw() {
        const getX = (c) => c * this.canvas.width;
        const getY = (c) => c * this.canvas.height;
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const timeSinceError = performance.now() - this.lastErrorTime;
        if (timeSinceError < 500) {
            const flashOpacity = 0.4 * (1 - (timeSinceError / 500));
            this.ctx.fillStyle = `rgba(255, 0, 0, ${flashOpacity})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        if (this.isShaking) {
            let intensity = this.shakeIntensity;
            if (this.tools.munhequeira) intensity /= 2;
            const dx = (Math.random() - 0.5) * intensity;
            const dy = (Math.random() - 0.5) * intensity;
            this.ctx.translate(dx, dy);
        }

        if (this.tools.decalque) {
            this.sigil.segments.forEach((seg, index) => {
                this.ctx.strokeStyle = 'rgba(50, 100, 255, 0.2)'; this.ctx.lineWidth = 3; this.ctx.beginPath();
                const startNode = this.nodes[index];
                this.ctx.moveTo(getX(startNode.x), getY(startNode.y));
                if (seg.type === 'curve') { this.ctx.quadraticCurveTo(getX(seg.control.x), getY(seg.control.y), getX(seg.end.x), getY(seg.end.y)); } 
                else { this.ctx.lineTo(getX(seg.end.x), getY(seg.end.y)); }
                this.ctx.stroke();
            });
        }
        
        this.lockedSegments.forEach(compSeg => {
            const start = this.nodes[compSeg.index]; const end = this.nodes[compSeg.index + 1];
            if (this.isBloodTattoo) this.ctx.strokeStyle = '#6d1414';
            else if (this.activeSpecialInk) this.ctx.strokeStyle = '#4a0e69';
            else this.ctx.strokeStyle = '#16a085';
            this.ctx.lineWidth = 5; this.ctx.beginPath(); this.ctx.moveTo(getX(start.x), getY(start.y));
            if (compSeg.type === 'curve') { this.ctx.quadraticCurveTo(getX(compSeg.control.x), getY(compSeg.control.y), getX(end.x), getY(end.y)); } 
            else { this.ctx.lineTo(getX(end.x), getY(end.y)); }
            this.ctx.stroke();
        });

        if (this.minigameState === 'STRETCHING' || this.minigameState === 'BENDING' || this.minigameState === 'DRAGGING_CONTROL') {
            if (this.isBloodTattoo) this.ctx.strokeStyle = '#a01c1c';
            else if (this.activeSpecialInk) this.ctx.strokeStyle = '#8e44ad';
            else this.ctx.strokeStyle = '#2ecc71';
            this.ctx.lineWidth = 4; this.ctx.beginPath();
            const startNode = this.nodes[this.currentSegmentIndex];
            this.ctx.moveTo(getX(startNode.x), getY(startNode.y));
            if (this.minigameState === 'STRETCHING') { this.ctx.lineTo(this.mousePos.x, this.mousePos.y); } 
            else { const endNode = this.nodes[this.currentSegmentIndex + 1]; this.ctx.quadraticCurveTo(this.tempControlPoint.x, this.tempControlPoint.y, getX(endNode.x), getY(endNode.y)); }
            this.ctx.stroke();
        }

        this.nodes.forEach((node, index) => {
            const isVisible = index <= this.currentSegmentIndex + 1;
            if (!isVisible && !this.tools.decalque) return;
            const nodeRadius = 12;
            this.ctx.beginPath();
            this.ctx.arc(getX(node.x), getY(node.y), nodeRadius, 0, 2 * Math.PI);
            const isActive = index === this.currentSegmentIndex;
            this.ctx.fillStyle = isActive ? '#2980b9' : 'rgba(100, 95, 80, 0.5)';
            if (index < this.currentSegmentIndex) this.ctx.fillStyle = '#16a085';
            this.ctx.globalAlpha = isVisible ? 1.0 : 0.2; this.ctx.fill(); this.ctx.globalAlpha = 1.0;
            if (this.tools.luminaria || isVisible) {
                this.ctx.font = `bold ${nodeRadius * 1.1}px 'Special Elite', cursive`; this.ctx.fillStyle = "#1a1a1a";
                this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
                this.ctx.fillText(index + 1, getX(node.x), getY(node.y));
            }
        });
        
        if (this.minigameState === 'BENDING' || this.minigameState === 'DRAGGING_CONTROL') {
            this.ctx.beginPath(); this.ctx.arc(this.tempControlPoint.x, this.tempControlPoint.y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.minigameState === 'DRAGGING_CONTROL' ? '#f39c12' : '#e67e22'; this.ctx.fill();
        }

        this.bleedParticles.forEach(p => {
            this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = `rgba(${this.isBloodTattoo ? '160, 28, 28' : '192, 57, 43'}, ${p.opacity})`; this.ctx.fill();
        });
        
        const pointerSize = 20;
        this.ctx.fillStyle = 'rgba(241, 196, 15, 0.9)'; this.ctx.strokeStyle = '#1a1a1a'; this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#f1c40f'; this.ctx.shadowBlur = 8;
        this.ctx.beginPath(); this.ctx.moveTo(this.mousePos.x, this.mousePos.y);
        this.ctx.lineTo(this.mousePos.x - (pointerSize / 3), this.mousePos.y + pointerSize);
        this.ctx.lineTo(this.mousePos.x + (pointerSize / 3), this.mousePos.y + pointerSize);
        this.ctx.closePath(); this.ctx.fill(); this.ctx.stroke(); this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }

    getMousePos(evt) { const rect = this.canvas.getBoundingClientRect(); return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }; }
    
    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        const getX = (c) => c * this.canvas.width; const getY = (c) => c * this.canvas.height;
        const hitRadius = 15;
        if (this.minigameState === 'IDLE' && this.currentSegmentIndex < this.nodes.length - 1) {
            const startNode = this.nodes[this.currentSegmentIndex];
            if (Math.hypot(pos.x - getX(startNode.x), pos.y - getY(startNode.y)) < hitRadius) { this.minigameState = 'STRETCHING'; }
        } else if (this.minigameState === 'BENDING') {
            if (Math.hypot(pos.x - this.tempControlPoint.x, pos.y - this.tempControlPoint.y) < hitRadius + 5) { this.minigameState = 'DRAGGING_CONTROL'; }
        }
    }
    
    handleMouseMove(e) {
        this.mousePos = this.getMousePos(e);
        if (this.minigameState === 'DRAGGING_CONTROL') { this.tempControlPoint = this.mousePos; }
    }
    
    handleMouseLeave(e) { this.mousePos = { x: -200, y: -200 }; }

    // ✨ FUNÇÃO ATUALIZADA ✨
    handleMouseUp(e) {
        // Se o minigame já terminou, não faz mais nada.
        if (this.minigameState === 'FINISHED') return;

        const pos = this.getMousePos(e);
        const getX = (c) => c * this.canvas.width;
        const getY = (c) => c * this.canvas.height;
        const hitRadius = 15;

        if (this.minigameState === 'STRETCHING') {
            const endNode = this.nodes[this.currentSegmentIndex + 1];
            const endNodePos = { x: getX(endNode.x), y: getY(endNode.y) };

            // Se o jogador errou o ponto de conexão...
            if (Math.hypot(pos.x - endNodePos.x, pos.y - endNodePos.y) > hitRadius) {
                // Usa o novo contador de erros
                this.errorCount++; 
                this.showErrorFeedback(`Cuidado! Você errou a conexão. (${this.errorCount}/4)`);
                this.minigameState = 'IDLE';

                // Verifica se o limite de erros foi atingido
                if (this.errorCount >= 4) {
                    this.finish(false); // Termina o minigame com falha
                }
                return;
            }

            const segment = this.sigil.segments[this.currentSegmentIndex];
            if (segment.type === 'line') {
                this.lockedSegments.push({ type: 'line', index: this.currentSegmentIndex });
                if (segment.painEvent) { this.triggerPainEvent(segment); }
                this.currentSegmentIndex++;
                this.minigameState = 'IDLE';
            } else {
                const startNode = this.nodes[this.currentSegmentIndex];
                this.tempControlPoint = { x: (getX(startNode.x) + endNodePos.x) / 2, y: (getY(startNode.y) + endNodePos.y) / 2 };
                this.minigameState = 'BENDING';
            }

        } else if (this.minigameState === 'DRAGGING_CONTROL') {
            const segment = this.sigil.segments[this.currentSegmentIndex];
            const idealControl = { x: getX(segment.control.x), y: getY(segment.control.y) };
            
            const curveError = Math.hypot(this.tempControlPoint.x - idealControl.x, this.tempControlPoint.y - idealControl.y);
            this.totalErrorScore += curveError; // O score de precisão ainda é útil

            // Se a curva estiver muito errada...
            if (curveError > 50) {
                // Usa o novo contador de erros
                this.errorCount++;
                this.showErrorFeedback(`Essa curva não está certa... Tente de novo. (${this.errorCount}/4)`);
                this.minigameState = 'BENDING';

                // Verifica se o limite de erros foi atingido
                if (this.errorCount >= 4) {
                    this.finish(false); // Termina o minigame com falha
                }
                return;
            }

            this.lockedSegments.push({ type: 'curve', index: this.currentSegmentIndex, control: { x: this.tempControlPoint.x / this.canvas.width, y: this.tempControlPoint.y / this.canvas.height } });
            if (segment.painEvent) { this.triggerPainEvent(segment); }
            this.currentSegmentIndex++;
            this.minigameState = 'IDLE';
        }

        // Se todos os segmentos foram completados com sucesso...
        if (this.currentSegmentIndex >= this.sigil.segments.length) {
            this.finish(true);
        }
    }
    
    resize() {
        const parent = this.canvas.parentElement; if (!parent) return;
        this.canvas.width = parent.clientWidth; this.canvas.height = parent.clientHeight;
        this.drawSigilReference();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let gameState = JSON.parse(localStorage.getItem('gameState'));
    if (gameState) {
        gameState.purchasedUpgrades = new Set(Array.isArray(gameState.purchasedUpgrades) ? gameState.purchasedUpgrades : []);
        gameState.discoveredSigils = new Set(Array.isArray(gameState.discoveredSigils) ? gameState.discoveredSigils : []);
        gameState.craftingIngredients = gameState.craftingIngredients || {};
        gameState.craftedInks = gameState.craftedInks || {};
        gameState.recargasBorrifador = gameState.recargasBorrifador || 0;
    }

    const sigilId = gameState ? gameState.playerSigilChoice : null;
    const sigil = sigilId ? SIGILS[sigilId] : null;
    if (!gameState || !sigil) {
        console.error("Erro Crítico: gameState ou dados do sigilo não encontrados.");
        alert("Erro ao carregar os dados da tatuagem.");
        window.location.href = '/game.html';
        return;
    }

    const canvas = document.getElementById('tattoo-canvas');
    const onMinigameComplete = (result) => {
        gameState.lastOutcomeData = result; 
        gameState.purchasedUpgrades = Array.from(gameState.purchasedUpgrades);
        gameState.discoveredSigils = Array.from(gameState.discoveredSigils);
        localStorage.setItem('gameState', JSON.stringify(gameState));
        window.location.href = '/game.html';
    };
    new MasterMinigame(canvas, sigil, gameState, onMinigameComplete);
});
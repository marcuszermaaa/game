// js/analysis.js - VERSÃO COMPLETA E BRUTA COM DEBUGS DETALHADOS

import { CLIENTS } from '../js/data/clientData.js'; 
import { SIGILS } from '../js/data/sigilData.js';

class AnalysisMinigame {
    constructor() {
        console.log("✅ [DEBUG] AnalysisMinigame instanciado.");
        this.dom = {
            canvas: document.getElementById('sigil-canvas'),
            notesContent: document.getElementById('notes-content'),
            toolPanel: document.getElementById('tool-panel'),
            decisionPanel: document.getElementById('decision-panel'),
            instructionText: document.getElementById('instruction-text')
        };
        this.ctx = this.dom.canvas.getContext('2d');
        this.lupaActive = false;
        
        this.init();
    }

    init() {
        console.log("✅ [DEBUG] init() chamado.");
        this.loadData();

        if (!this.client || !this.requestedSigil) {
            console.error("❌ [DEBUG] ERRO CRÍTICO: Cliente ou Sigilo não carregados. Abortando inicialização.");
            return;
        }

        this.setupTools();
        this.renderDecisionButtons(false);
        window.addEventListener('resize', () => this.drawSigil());
        
        // Adicionado um pequeno delay para garantir que o layout do CSS foi calculado
        setTimeout(() => {
            this.drawSigil();
        }, 100);

        if (!this.hasLupa) {
            this.dom.instructionText.textContent = "Você não tem ferramentas. Confie em sua intuição e em suas anotações.";
            setTimeout(() => {
                this.renderDecisionButtons(true);
            }, 3000);
        }
    }

    loadData() {
        console.log("--- 🕵️‍♂️ [DEBUG] Iniciando loadData ---");
        const urlParams = new URLSearchParams(window.location.search);
        this.day = parseInt(urlParams.get('day'));
        const clientIndex = parseInt(urlParams.get('clientIndex'));
        console.log(`[DEBUG] Parâmetros da URL: day=${this.day}, clientIndex=${clientIndex}`);

        if (isNaN(this.day) || isNaN(clientIndex)) {
            console.error("❌ [DEBUG] Parâmetros de dia ou índice de cliente inválidos na URL!");
        }

        this.gameState = JSON.parse(localStorage.getItem('gameState')) || {};
        console.log("[DEBUG] GameState carregado:", this.gameState);
        this.gameState.purchasedUpgrades = new Set(this.gameState.purchasedUpgrades || []);

        const clientsForDay = CLIENTS.filter(c => c.day === this.day);
        this.client = clientsForDay[clientIndex];
        
        if (this.client) {
            console.log("✅ [DEBUG] Cliente encontrado:", this.client);
            this.requestedSigil = SIGILS[this.client.request];
            if (this.requestedSigil) {
                console.log("✅ [DEBUG] Sigilo solicitado encontrado:", this.requestedSigil);
            } else {
                console.error(`❌ [DEBUG] ERRO: Sigilo com ID '${this.client.request}' NÃO foi encontrado em sigilData.js!`);
            }
        } else {
            console.error(`❌ [DEBUG] ERRO: Cliente com índice '${clientIndex}' NÃO foi encontrado para o dia ${this.day}!`);
        }
        console.log("--- [DEBUG] Fim do loadData ---");
    }

    setupTools() {
        console.log("✅ [DEBUG] setupTools() chamado.");
        this.hasLupa = this.gameState.purchasedUpgrades.has('lupa_analise');
        console.log(`[DEBUG] Jogador possui Lupa? ${this.hasLupa}`);
        if (this.hasLupa) {
            const lupaBtn = document.createElement('button');
            lupaBtn.id = 'lupa-btn';
            lupaBtn.textContent = 'Ativar Lupa';
            lupaBtn.addEventListener('click', () => this.toggleLupa());
            this.dom.toolPanel.appendChild(lupaBtn);
        }
    }
    
    toggleLupa() {
        this.lupaActive = !this.lupaActive;
        this.dom.canvas.classList.toggle('lupa-active', this.lupaActive);
        document.getElementById('lupa-btn').classList.toggle('active', this.lupaActive);
        
        if (this.lupaActive) {
            this.dom.instructionText.textContent = "Passe a lupa sobre o sigilo para encontrar instabilidades.";
            this.revealCorruptionPoints();
        } else {
            this.dom.instructionText.textContent = "Examine o desenho em busca de anomalias.";
            this.hideCorruptionPoints();
        }
    }

    drawSigil() {
        console.log("--- 🎨 [DEBUG] Iniciando drawSigil ---");
        if (!this.requestedSigil) {
            console.error("❌ [DEBUG] Tentou desenhar, mas 'this.requestedSigil' é inválido.");
            return;
        }

        this.dom.canvas.width = this.dom.canvas.clientWidth;
        this.dom.canvas.height = this.dom.canvas.clientHeight;
        const w = this.dom.canvas.width;
        const h = this.dom.canvas.height;
        console.log(`[DEBUG] Dimensões do Canvas: ${w}w x ${h}h`);

        if (w === 0 || h === 0) {
            console.warn("⚠️ [DEBUG] Aviso: O canvas tem dimensão zero. O desenho não será visível.");
        }

        this.ctx.clearRect(0, 0, w, h);
        this.ctx.strokeStyle = '#3a3a3a';
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        
        const startNode = this.requestedSigil.startNode;
        let currentNode = startNode;

        console.log("[DEBUG] Desenhando segmentos do sigilo:", this.requestedSigil.segments);
        if (!this.requestedSigil.segments || this.requestedSigil.segments.length === 0) {
            console.error("❌ [DEBUG] ERRO: Os dados dos segmentos do sigilo estão ausentes!");
            return;
        }

        this.requestedSigil.segments.forEach((segment, index) => {
            const getX = (coord) => coord * w;
            const getY = (coord) => coord * h;

            this.ctx.beginPath();
            this.ctx.moveTo(getX(currentNode.x), getY(currentNode.y));
            
            if (segment.type === 'curve') {
                this.ctx.quadraticCurveTo(getX(segment.control.x), getY(segment.control.y), getX(segment.end.x), getY(segment.end.y));
            } else {
                this.ctx.lineTo(getX(segment.end.x), getY(segment.end.y));
            }
            
            this.ctx.stroke();
            currentNode = segment.end;
        });
        console.log("--- ✅ [DEBUG] Fim do drawSigil ---");
    }
    
    revealCorruptionPoints() {
        this.hideCorruptionPoints();

        if (this.requestedSigil.corruptionPoints && Array.isArray(this.requestedSigil.corruptionPoints)) {
            this.requestedSigil.corruptionPoints.forEach(point => {
                this.createCorruptionPoint(point.x, point.y, point.note);
            });
        }
    }

    hideCorruptionPoints() {
        document.querySelectorAll('.corruption-point').forEach(p => p.remove());
    }

    createCorruptionPoint(x, y, noteText) {
        const point = document.createElement('div');
        point.className = 'corruption-point';
        const canvasRect = this.dom.canvas.getBoundingClientRect();
        point.style.left = `${canvasRect.left + canvasRect.width * x}px`;
        point.style.top = `${canvasRect.top + canvasRect.height * y}px`;
        
        point.addEventListener('click', () => {
            this.dom.notesContent.querySelector('.placeholder')?.remove();
            const noteEl = document.createElement('div');
            noteEl.className = 'note';
            noteEl.textContent = noteText;
            this.dom.notesContent.appendChild(noteEl);
            noteEl.style.display = 'block';
            point.remove();
            this.renderDecisionButtons(true);
        });
        
        document.body.appendChild(point);
    }
    
    renderDecisionButtons(show) {
        if (!show) {
            this.dom.decisionPanel.classList.add('hidden');
            return;
        }

        let dialogueOptions = '';
        if (this.requestedSigil.type === 'corrupted') {
            dialogueOptions += `<button data-choice="correct">"Notei um erro. O correto é este."</button>`;
            dialogueOptions += `<button data-choice="accept_corrupted">"Farei como pedido."</button>`;
        } else if (this.requestedSigil.type === 'prohibited') {
            dialogueOptions += `<button data-choice="refuse">"Eu me recuso."</button>`;
            dialogueOptions += `<button data-choice="accept_prohibited">"Se insiste..."</button>`;
        }
        
        this.dom.decisionPanel.innerHTML = dialogueOptions;
        this.dom.decisionPanel.classList.remove('hidden');

        this.dom.decisionPanel.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const choice = e.target.dataset.choice;
                this.gameState.analysisChoice = choice;
                this.gameState.purchasedUpgrades = Array.from(this.gameState.purchasedUpgrades);
                localStorage.setItem('gameState', JSON.stringify(this.gameState));
                window.location.href = '/game.html';
            });
        });
    }
}

try {
    new AnalysisMinigame();
} catch (e) {
    console.error("❌ [DEBUG] ERRO FATAL ao tentar instanciar AnalysisMinigame:", e);
    alert("Ocorreu um erro crítico na tela de análise. Verifique o console para detalhes.");
}
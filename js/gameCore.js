// js/gameCore.js - Versão corrigida para resolver o congelamento na inicialização.

import { CLIENTS_PER_DAY } from './constants.js';
import { ClientManager } from './managers/ClientManager.js';
import { DialogueManager } from './managers/DialogueManager.js';
import { UIManager } from './managers/UIManager.js';
import { SIGILS } from './data/sigilData.js'; 
// js/gameCore.js

// js/gameCore.js


class GameManager {
    static instance = null;
    constructor() {
        if (GameManager.instance) return GameManager.instance;
        GameManager.instance = this;
        console.log("Inicializando instância do GameManager...");
        this.dom = {
            characterSprite: document.getElementById('character-sprite'),
            actionPanel: document.getElementById('action-panel'),
            eventClientName: document.getElementById('event-client-name'),
            eventDialogue: document.getElementById('event-dialogue'),
            dialogueInteractionPanel: document.getElementById('dialogue-interaction-panel'),
            dialogueText: document.getElementById('dialogue-text'),
            dialogueOptionsContainer: document.getElementById('dialogue-options-container'),
            dayStat: document.getElementById('day-stat'),
            clientStat: document.getElementById('client-stat'),
            moneyValue: document.getElementById('money-value'),
            sanityProgressBar: document.querySelector('.brain-progress .progress-bar'),
            itemMail: document.getElementById('item-mail'),
            itemBook: document.getElementById('item-book'),
            itemWorkbench: document.getElementById('item-workbench'),
        };
        this.init();
    }

    init() {
        this.loadGameState();
        this.instantiateManagers();
        this.bindGlobalEvents();
        this.processPendingState();
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            this.state = JSON.parse(savedState);
            this.state.purchasedUpgrades = new Set(this.state.purchasedUpgrades || []);
        } else {
            this.setupInitialState();
        }
    }

    setupInitialState() {
        this.state = {
            day: 0, clientInDay: 0, sanity: 100, money: 50,
            showingTutorial: true, tutorialStep: 'initial_mail',
            postTutorialSequence: false, 
            playerSigilChoice: null, purchasedUpgrades: new Set(),
            lastOutcomeData: null, analysisChoice: null,
        };
    }

    instantiateManagers() {
        this.clientManager = new ClientManager(this.state);
        this.dialogueManager = new DialogueManager(this.state, this);
        this.uiManager = new UIManager(this.dom, this.state, this);
    }
    
    saveGameState() {
        const stateToSave = { ...this.state, purchasedUpgrades: Array.from(this.state.purchasedUpgrades) };
        localStorage.setItem('gameState', JSON.stringify(stateToSave));
    }
    
    bindGlobalEvents() {
        this.dom.itemMail?.addEventListener('click', () => {
            if ((this.state.showingTutorial && this.state.tutorialStep === 'initial_mail') || !this.state.showingTutorial) this.openMail();
        });
        this.dom.itemBook?.addEventListener('click', () => {
             if (this.state.showingTutorial && this.state.tutorialStep !== 'read_mail_then_diary') return;
             this.openJournal();
        });
        this.dom.itemWorkbench?.addEventListener('click', () => {
            if (!this.state.showingTutorial) this.openWorkbench();
        });
    }

    /**
     * O "roteador" principal do jogo. A ordem das verificações é a prioridade das cenas.
     * Esta função foi corrigida para parar a execução após lidar com um estado pendente.
     */
    processPendingState() {

        if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
        
        // <<< MUDANÇA AQUI >>>
        // Exibe os itens da bancada sempre que a tela principal é processada.
        // Isso garante que eles apareçam após retornar da fase noturna.
        this.uiManager.displayPurchasedUpgrades();

        if (this.state.showingTutorial) {
            this.uiManager.setupTutorialUI(this.state.tutorialStep);
            this.uiManager.updateStats();
            return;
        }

        if (this.state.postTutorialSequence) {
            this.uiManager.showStartDayView(() => this.startFirstClientOfDay());
            return;
        }

        if (this.state.lastOutcomeData) {
            this.processMinigameOutcome();
            return;
        }

        if (this.state.analysisChoice) {
            this.processAnalysisChoice();
            return; // Também para a execução aqui.
        }

        // Se nenhuma condição especial for atendida, continua para o fluxo de jogo normal.
        if (!this.clientManager.hasClientsForDay(this.state.day)) {
            this.endGame("Você chegou ao fim do capítulo atual.");
            return;
        }

        if (this.state.day > 0 && this.state.clientInDay > 0) {
            this.uiManager.resetClientInterface();
            this.uiManager.updateActionButtonBasedOnState();
            this.uiManager.updateStats();
        }
    }
    
    /**
     * Centraliza o processamento do resultado do minigame.
     */
    processMinigameOutcome() {
        const outcome = this.state.lastOutcomeData;
        const client = this.clientManager.getCurrentClient();
        if (!outcome || !client) {
            this.state.lastOutcomeData = null; this.saveGameState(); this.advanceToNextClient(); return;
        }
        
        let moneyChange = 0, sanityChange = 0, outcomeTitle = "", outcomeMessage = "";
        const isCorrectSigil = (this.state.playerSigilChoice === client.correctSigil);

        if (outcome.success) {
            if (isCorrectSigil) {
                outcomeTitle = "Trabalho Impecável"; moneyChange = client.successPay; sanityChange = 5;
                outcomeMessage = `Você desenhou o sigilo correto com perfeição. O cliente parece aliviado e paga o valor total. (+${moneyChange} Moedas, +${sanityChange} Sanidade)`;
            } else {
                outcomeTitle = "Erro de Julgamento"; moneyChange = client.wrongPay; sanityChange = -15;
                outcomeMessage = `Sua mão foi firme, mas o sigilo era o errado. Consequências inesperadas podem surgir... (${moneyChange} Moedas, ${sanityChange} Sanidade)`;
            }
        } else {
            outcomeTitle = "Mão Trêmula"; moneyChange = client.failPay; sanityChange = -10;
            outcomeMessage = `Você falhou em completar o desenho. O cliente está insatisfeito. (${moneyChange} Moedas, ${sanityChange} Sanidade)`;
        }
        
        this.state.money += moneyChange;
        this.changeSanity(sanityChange);

        // A função de callback para o botão "Próximo" é passada aqui.
        this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => this.advanceToNextClient());

        // Limpa os dados para evitar reprocessamento.
        this.state.lastOutcomeData = null;
        this.state.playerSigilChoice = null;
        this.saveGameState();
    }

    startFirstClientOfDay() {
        this.state.postTutorialSequence = false;
        this.advanceToNextClient();
    }
    
    advanceToNextClient() {
        if (this.state.clientInDay >= CLIENTS_PER_DAY) {
            this.startEndDaySequence();
            return;
        }
        
        this.state.clientInDay++;
        this.state.playerSigilChoice = null;
        
        const nextClient = this.clientManager.getCurrentClient();
        if (this.clientManager.shouldDisplayClient(nextClient)) {
            this.uiManager.resetClientInterface();
            this.uiManager.updateActionButtonBasedOnState();
            this.uiManager.updateStats();
        } else {
            this.advanceToNextClient();
        }
        this.saveGameState();
    }

    // --- Funções de Navegação e Ação ---
    startEndDaySequence() { this.saveGameState(); window.location.href = '/night.html'; }
    endGame(reason) { this.uiManager.showEndGameView(reason, () => { localStorage.removeItem('gameState'); window.location.reload(); }); }
    openJournal() { this.saveGameState(); window.location.href = '/journal.html'; }
    openMail() { this.saveGameState(); window.location.href = '/mail.html'; }
    openWorkbench() { this.saveGameState(); window.location.href = '/workbench.html'; }
    startMinigame() {
        if (this.state.playerSigilChoice) {
            this.saveGameState();
            window.location.href = `/minigame.html?sigil=${this.state.playerSigilChoice}`;
        } else {
            alert("ERRO: Nenhum sigilo foi selecionado para tatuar.");
        }
    }
    changeSanity(amount) {
        this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + amount));
        this.uiManager.updateStats();
        if (this.state.sanity <= 0) { this.endGame("Sua mente se despedaçou sob o peso do que viu. O abismo te consumiu."); }
    }
    startAnalysis() { /* Sua lógica de análise */ }
    processAnalysisChoice() { /* Sua lógica de análise */ }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.game === 'undefined') {
        window.game = new GameManager();
    }
});
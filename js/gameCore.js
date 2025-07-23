// js/gameCore.js - VERSÃO COMPLETA E REVISADA

import { CLIENTS_PER_DAY } from './constants.js';
import { MAX_INK, STARTING_INK_PER_DAY } from './constants.js';
import { ClientManager } from './managers/ClientManager.js';
import { DialogueManager } from './managers/DialogueManager.js';
import { UIManager } from './managers/uiManager.js';
import { SIGILS } from './data/sigilData.js';
import { MAILS } from './data/mailData.js';


class GameManager {
    static instance = null;
    constructor() {
        if (GameManager.instance) return GameManager.instance;
        GameManager.instance = this;
        console.log("Inicializando instância do GameManager...");
        this.dom = {
            characterSprite: document.getElementById('character-sprite'),
            actionPanel: document.getElementById('action-panel'),
            infoPanel: document.getElementById('info-panel'),
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
            inkValue: document.getElementById('ink-value'),
            itemBook: document.getElementById('item-book'),
            itemWorkbench: document.getElementById('item-workbench'),
            analyzeRequestBtn: document.getElementById('analyze-request-btn'),
        };
        this.init();
    }

    init() {
        this.loadGameState();
        this.instantiateManagers();
        this.bindGlobalEvents();
        this.uiManager.updateCoreUIElements(this.checkForUnreadMail());
        this.processPendingState();
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                this.state = JSON.parse(savedState);
                this.state.purchasedUpgrades = new Set(Array.isArray(this.state.purchasedUpgrades) ? this.state.purchasedUpgrades : []);
                this.state.readMailIds = new Set(Array.isArray(this.state.readMailIds) ? this.state.readMailIds : []);
                this.state.clientHistory = Array.isArray(this.state.clientHistory) ? this.state.clientHistory : [];
                // Carrega os sigilos descobertos, começando com um array vazio se não houver nada salvo.
                this.state.discoveredSigils = new Set(Array.isArray(this.state.discoveredSigils) ? this.state.discoveredSigils : []);
                this.state.craftingIngredients = new Set(Array.isArray(this.state.craftingIngredients) ? this.state.craftingIngredients : []);
            } catch (e) {
                console.error("GameManager: Erro ao carregar ou parsear gameState:", e);
                this.setupInitialState();
            }
        } else {
            this.setupInitialState();
        }
        console.log("GameManager: Estado do jogo carregado:", this.state);
    }

     setupInitialState() {
        this.state = {
            day: 1,
            clientInDay: 1,
            sanity: 100,
            money: 50,
            showingTutorial: true,
            tutorialStep: 'initial_letter_prompt',
            playerSigilChoice: null, 
            inkCharges: MAX_INK,
            purchasedUpgrades: new Set(),
            readMailIds: new Set(),
            lastOutcomeData: null, 
            analysisChoice: null,
            clientHistory: [], 
            
            // ========================================================== //
            //      >>> DEFINIÇÃO ATUALIZADA DOS SIGILOS INICIAIS <<<     //
            // ========================================================== //
            // O jogador começa conhecendo apenas a "Âncora da Realidade",
            // o sigilo básico que Abner teria deixado mais à vista.
            discoveredSigils: new Set(['s04']),
            
            craftingIngredients: new Set(),
        };
    }
    instantiateManagers() {
        this.clientManager = new ClientManager(this.state);
        this.dialogueManager = new DialogueManager(this.state, this);
        this.uiManager = new UIManager(this.dom, this.state, this);
    }
    
    saveGameState() {
        const stateToSave = { 
            ...this.state, 
            purchasedUpgrades: Array.from(this.state.purchasedUpgrades),
            readMailIds: Array.from(this.state.readMailIds),
            discoveredSigils: Array.from(this.state.discoveredSigils),
            craftingIngredients: Array.from(this.state.craftingIngredients),
        };
        localStorage.setItem('gameState', JSON.stringify(stateToSave));
    }
    
    bindGlobalEvents() {
        this.dom.itemMail?.addEventListener('click', () => {
            if (this.state.tutorialStep === 'initial_letter_prompt') {
                this.openMail();
            } else if (!this.state.showingTutorial) {
                this.openMail();
            }
        });
      
        this.dom.itemBook?.addEventListener('click', () => {
            if (this.state.tutorialStep === 'journal_prompt') {
                this.openJournal();
            } else if (!this.state.showingTutorial) {
                this.openJournal();
            }
        });

        this.dom.itemWorkbench?.addEventListener('click', () => {
            if (!this.state.showingTutorial) this.openWorkbench();
        });
    }

    processPendingState() {
        if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
        
        if (this.state.showingTutorial) {
            this.runTutorial();
            return;
        }
        
        const currentClient = this.clientManager.getCurrentClient();
        if (currentClient && currentClient.isNarrativeEvent) {
            this.uiManager.displayNarrativeEvent(currentClient, () => {
                if (currentClient.action) {
                    this.processEventAction(currentClient.action);
                }
                if (currentClient.action?.type === 'add_ingredient') {
                    this.uiManager.highlightWorkbenchIcon();
                }

                this.uiManager.showNextClientTransition(
                    "O Professor se despede, deixando-o com suas palavras e um novo mistério. O sino da porta toca novamente.",
                    "Atender Próximo Cliente",
                    () => {
                        this.state.clientInDay++;
                        this.saveGameState();
                        this.processPendingState();
                    }
                );
            });
            return;
        }

        if (this.state.isNewDay) {
            this.uiManager.showStartDayView(() => {
                this.state.isNewDay = false;
                this.startFirstClientOfDay();
            });
            return;
        }

        if (this.state.lastOutcomeData) {
            this.processMinigameOutcome();
            return; 
        }

        if (this.state.analysisChoice) {
            this.processAnalysisChoice();
            return; 
        }

        if (!this.clientManager.getCurrentClient()) {
             if (!this.clientManager.hasClientsForDay(this.state.day) && this.state.day > 0) {
                this.endGame("Você chegou ao fim do capítulo atual.");
             } else {
                 this.startEndDaySequence();
             }
            return;
        }

        this.uiManager.resetClientInterface();
        this.uiManager.updateActionButtonBasedOnState();
        this.uiManager.updateStats();
    }

    processEventAction(action) {
        switch (action.type) {
            case 'add_ingredient':
                this.state.craftingIngredients.add(action.payload);
                console.log(`Ingrediente adicionado: ${action.payload}. Inventário atual:`, this.state.craftingIngredients);
                break;
        }
    }

    runTutorial() {
        console.log(`Tutorial rodando no passo: ${this.state.tutorialStep}`);
        this.uiManager.updateStats();

        switch (this.state.tutorialStep) {
            case 'initial_letter_prompt':
                this.uiManager.showTutorialStep_LetterPrompt();
                break;
            
            case 'armitage_arrival_prompt':
                this.uiManager.showTutorialStep_ArmitageArrival(() => {
                    this.state.tutorialStep = 'armitage_dialogue';
                    this.saveGameState();
                    this.runTutorial();
                });
                break;

            case 'armitage_dialogue':
                const armitageData = this.clientManager.getCurrentClient();
                this.uiManager.showTutorialStep_ArmitageDialogue(armitageData, () => {
                    this.state.tutorialStep = 'journal_prompt';
                    this.saveGameState();
                    this.runTutorial();
                });
                break;
            
            case 'journal_prompt':
                this.uiManager.showTutorialStep_JournalPrompt();
                break;

            case 'final_wait':
                this.uiManager.showTutorialStep_FinalWait(() => {
                    console.log("TUTORIAL CONCLUÍDO. Carregando primeiro cliente real.");
                    this.state.showingTutorial = false;
                    this.state.tutorialStep = 'completed';
                    this.state.clientInDay++; 
                    this.saveGameState();
                    this.processPendingState();
                });
                break;
        }
    }
    
    processMinigameOutcome() {
        const outcome = this.state.lastOutcomeData;
        const client = this.clientManager.getCurrentClient();
        if (!outcome || !client) {
            this.state.lastOutcomeData = null; this.saveGameState(); this.advanceToNextClient(); return;
        }
        
        let moneyChange = 0, sanityChange = 0, outcomeTitle = "", outcomeMessage = "";
        const isCorrectSigil = (this.state.playerSigilChoice === client.correctSigil);
        let clientOutcome = '';

        if (outcome.success) {
            if (isCorrectSigil) {
                outcomeTitle = "Trabalho Impecável"; moneyChange = client.successPay; sanityChange = 5;
                outcomeMessage = `Você desenhou o sigilo correto com perfeição. O cliente parece aliviado e paga o valor total. (+${moneyChange} Moedas, +${sanityChange} Sanidade)`;
                clientOutcome = 'success';
            } else {
                outcomeTitle = "Erro de Julgamento"; moneyChange = client.wrongPay; sanityChange = -15;
                outcomeMessage = `Sua mão foi firme, mas o sigilo era o errado. Consequências inesperadas podem surgir... (${moneyChange} Moedas, ${sanityChange} Sanidade)`;
                clientOutcome = 'wrong_sigil';
            }
        } else {
            outcomeTitle = "Mão Trêmula"; moneyChange = client.failPay; sanityChange = -10;
            outcomeMessage = `Você falhou em completar o desenho. O cliente está insatisfeito. (${moneyChange} Moedas, ${sanityChange} Sanidade)`;
            clientOutcome = 'fail_minigame';
        }
        
        this.state.money += moneyChange;
        this.changeSanity(sanityChange);
        this.state.clientHistory.push({ clientId: client.id, day: this.state.day, sigilTattooed: this.state.playerSigilChoice, outcome: clientOutcome, notes: outcomeMessage, payment: moneyChange, sanityChange: sanityChange });
        this.state.lastOutcomeData = null;
        this.state.playerSigilChoice = null;
        this.saveGameState();
        this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => this.advanceToNextClient());
    }

    startFirstClientOfDay() {
        this.state.clientInDay = 1;
        this.saveGameState();
        this.processPendingState();
    }
    
    advanceToNextClient() {
        if (this.state.clientInDay >= CLIENTS_PER_DAY) {
            this.startEndDaySequence();
            return;
        }
        
        this.state.clientInDay++;
        this.state.playerSigilChoice = null;
        this.state.analysisChoice = null; 
        this.saveGameState();
        
        const nextClient = this.clientManager.getCurrentClient();
        if (nextClient) {
            this.processPendingState(); 
        } else { 
            this.startEndDaySequence();
        }
    }

    startEndDaySequence() {
        this.state.isNewDay = true;
        this.saveGameState();
        window.location.href = '/night.html';
    }
    
    endGame(reason) { 
        this.uiManager.showEndGameView(reason, () => { 
            localStorage.removeItem('gameState'); 
            window.location.reload(); 
        }); 
    }
    
    openJournal() { 
        this.saveGameState(); 
        window.location.href = '/journal.html'; 
    }
    
    openMail() { 
        this.saveGameState(); 
        window.location.href = '/mail.html'; 
    }
    
    openWorkbench() { 
        this.saveGameState(); 
        window.location.href = '/workbench.html'; 
    }
    
    startMinigame() {
        if (!this.state.playerSigilChoice) {
            console.warn("ERRO: Tentativa de iniciar minigame sem sigilo selecionado.");
            return; 
        }
        
        if (this.state.inkCharges > 0) {
            this.state.inkCharges--;
            this.uiManager.updateStats(); 
            
            this.saveGameState();
            window.location.href = `/minigame.html?sigil=${this.state.playerSigilChoice}`;
        } else {
            console.warn("Acabou sua Tinta!");
            this.uiManager.showInfoPanel({
                icon: '/media/icons/ink_empty_icon.png', 
                title: 'Tinta Esgotada!',
                button: {
                    id: 'ack-no-ink-btn',
                    text: 'Entendido',
                    callback: () => {} 
                }
            });
        }
    }
    
    changeSanity(amount) {
        this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + amount));
        this.uiManager.updateStats();
        if (this.state.sanity <= 0) { 
            this.endGame("Sua mente se despedaçou sob o peso do que viu. O abismo te consumiu."); 
        }
    }

    checkForUnreadMail() {
        if (!MAILS || !Array.isArray(MAILS)) return false;
        const receivedMails = MAILS.filter(mail => mail.receivedDay <= this.state.day);
        const readMailIds = new Set(this.state.readMailIds || []);
        return receivedMails.some(mail => !readMailIds.has(mail.id));
    }

    startAnalysisProcess() {
        const currentClient = this.clientManager.getCurrentClient();
        if (!currentClient || !currentClient.request) { return; }
        const clientsForToday = this.clientManager.getClientsForDay(this.state.day);
        const clientIndex = clientsForToday.findIndex(c => c.id === currentClient.id);
        if (clientIndex === -1) { return; }
        this.saveGameState();
        window.location.href = `/analysis.html?clientIndex=${clientIndex}&day=${this.state.day}`;
    }

    processAnalysisChoice() {
        const choice = this.state.analysisChoice;
        const client = this.clientManager.getCurrentClient();
        const requestedSigil = client ? SIGILS[client.request] : null;

        if (!choice || !client || !requestedSigil) {
            this.state.analysisChoice = null; this.saveGameState(); this.processPendingState(); return;
        }

        let outcomeTitle = "Análise Concluída", outcomeMessage = "", sanityChange = 0, playerSigilToTattoo = null, clientOutcome = ''; 

        switch (choice) {
            case 'correct':
                sanityChange = 5; 
                outcomeMessage = "Você identificou e se propôs a corrigir o sigilo. Sua mente está clara.";
                playerSigilToTattoo = requestedSigil.correctVersion; 
                clientOutcome = 'corrected_sigil';

                // Lógica para aprender o sigilo corrigido
                const correctSigilId = requestedSigil.correctVersion;
                if (!this.state.discoveredSigils.has(correctSigilId)) {
                    this.state.discoveredSigils.add(correctSigilId);
                    const learnedSigilName = SIGILS[correctSigilId]?.name || "um sigilo desconhecido";
                    outcomeMessage += `\n\n[NOVO SIGILO APRENDIDO: "${learnedSigilName}" foi adicionado ao seu grimório.]`;
                    console.log(`Jogador aprendeu um novo sigilo: ${correctSigilId} (${learnedSigilName})`);
                }
                break;
            case 'accept_corrupted':
                sanityChange = -20; 
                outcomeMessage = "Você decidiu seguir o pedido corrompido. O peso da decisão recai sobre sua sanidade.";
                playerSigilToTattoo = requestedSigil.id; 
                clientOutcome = 'accepted_corrupted';
                break;
            case 'refuse':
                sanityChange = 10; 
                outcomeMessage = "Você se recusou a tatuar o símbolo proibido. Sua convicção fortalece sua mente.";
                clientOutcome = 'refused_prohibited';
                break;
            case 'accept_prohibited':
                sanityChange = -50; 
                outcomeMessage = "Você cedeu à tentação e aceitou o sigilo proibido. As consequências serão terríveis.";
                playerSigilToTattoo = requestedSigil.id; 
                clientOutcome = 'accepted_prohibited';
                break;
            case 'accept_normal':
                outcomeMessage = "Você concordou em fazer o sigilo conforme o pedido. Um trabalho direto.";
                playerSigilToTattoo = requestedSigil.id; 
                clientOutcome = 'accepted_normal';
                break;
            default:
                outcomeMessage = "Algo inesperado aconteceu na análise."; 
                clientOutcome = 'unknown_analysis_outcome';
                break;
        }

        this.changeSanity(sanityChange);
        this.state.clientHistory.push({ clientId: client.id, day: this.state.day, analysisChoice: choice, sigilTattooed: playerSigilToTattoo, outcome: clientOutcome, notes: outcomeMessage, payment: 0, sanityChange: sanityChange });
        this.state.analysisChoice = null;

        if (choice === 'refuse') {
            this.state.playerSigilChoice = null;
            this.saveGameState();
            this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => { this.advanceToNextClient(); });
        } else if (playerSigilToTattoo) {
            this.state.playerSigilChoice = playerSigilToTattoo;
            this.saveGameState();
            // A transição para o minigame agora acontecerá após o jogador ler o resultado da análise
            this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => {
                 this.uiManager.resetClientInterface();
                 this.uiManager.updateActionButtonBasedOnState();
                 this.uiManager.updateStats();
            });
        } else {
            this.saveGameState();
            this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => { this.advanceToNextClient(); });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.game === 'undefined') {
        window.game = new GameManager();
    }
});
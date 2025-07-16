// js/gameCore.js - Versão revisada e atualizada

// --- IMPORTS ---
import { CLIENTS_PER_DAY } from './constants.js';
import { ClientManager } from './managers/ClientManager.js';
import { DialogueManager } from './managers/DialogueManager.js';
import { UIManager } from './managers/uiManager.js';
import { SIGILS } from './data/sigilData.js'; 
import { MAILS } from './data/mailData.js'; // IMPORT ADICIONADO: Necessário para verificar novas cartas.

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
        
        // --- LÓGICA ATUALIZADA ---
        // Atualiza elementos visuais persistentes da UI (como ícones de upgrade e notificações de e-mail)
        // ANTES de decidir qual tela principal renderizar.
        this.uiManager.updateCoreUIElements(this.checkForUnreadMail());
        
        this.processPendingState();
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            this.state = JSON.parse(savedState);
            // Garante que purchasedUpgrades seja um Set para checagens eficientes (ex: .has())
            this.state.purchasedUpgrades = new Set(this.state.purchasedUpgrades || []);
        } else {
            this.setupInitialState();
        }
                console.log("Estado CARREGADO do localStorage:", this.state);

    }

    setupInitialState() {
        this.state = {
            day: 0, clientInDay: 0, sanity: 100, money: 5000,
            showingTutorial: true, tutorialStep: 'initial_mail',
            postTutorialSequence: false, 
            isNewDay: false, // Flag para a tela de início de dia.
            playerSigilChoice: null, 
            purchasedUpgrades: new Set(),
            readMailIds: [], // Inicializa a lista de e-mails lidos.
            lastOutcomeData: null, 
            analysisChoice: null,
        };
    }

    instantiateManagers() {
        this.clientManager = new ClientManager(this.state);
        this.dialogueManager = new DialogueManager(this.state, this);
        this.uiManager = new UIManager(this.dom, this.state, this);
    }
    
    saveGameState() {
        // Converte o Set de volta para um Array para ser compatível com JSON.
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
     */
    processPendingState() {
        if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
        
        if (this.state.showingTutorial) {
            this.uiManager.setupTutorialUI(this.state.tutorialStep);
            this.uiManager.updateStats();
            return;
        }

        // --- LÓGICA ATUALIZADA ---
        // A tela de "novo dia" agora tem alta prioridade para ser exibida no início de cada dia.
        if (this.state.isNewDay) {
            this.uiManager.showStartDayView(() => {
                this.state.isNewDay = false; // Desativa a flag após o uso.
                this.startFirstClientOfDay();
            });
            return; // Para a execução aqui até o jogador interagir.
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
            return; 
        }

        if (!this.clientManager.hasClientsForDay(this.state.day)) {
            this.endGame("Você chegou ao fim do capítulo atual.");
            return;
        }

        // Se nenhuma condição especial foi atendida, prepara a interface para o cliente atual.
        if (this.state.day > 0 && this.state.clientInDay > 0) {
            this.uiManager.resetClientInterface();
            this.uiManager.updateActionButtonBasedOnState();
            this.uiManager.updateStats();
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

        this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => this.advanceToNextClient());

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
            // Se o cliente não deve ser exibido (ex: por falta de um upgrade),
            // avança para o próximo cliente automaticamente.
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
            // Este alerta pode ser substituído por uma mensagem na UI mais elegante.
            alert("ERRO: Nenhum sigilo foi selecionado para tatuar.");
        }
    }
    
    changeSanity(amount) {
        this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + amount));
        this.uiManager.updateStats();
        if (this.state.sanity <= 0) { this.endGame("Sua mente se despedaçou sob o peso do que viu. O abismo te consumiu."); }
    }

    /**
     * --- NOVA FUNÇÃO ---
     * Verifica se existem e-mails que o jogador deveria ter recebido mas ainda não leu.
     * @returns {boolean} True se houver e-mail não lido, false caso contrário.
     */
    checkForUnreadMail() {
        const receivedMails = MAILS.filter(mail => mail.receivedDay <= this.state.day);
        const readMailIds = new Set(this.state.readMailIds || []);
        
        // Usa .some() para parar a verificação assim que encontrar a primeira correspondência.
        return receivedMails.some(mail => !readMailIds.has(mail.id));
    }

    /**
     * NOVO MÉTODO: Processa a escolha feita na página de análise.
     * Chamado quando o jogador retorna de analysis.html.
     */
    processAnalysisChoice() {
        const choice = this.state.analysisChoice;
        const client = this.clientManager.getCurrentClient();
        const requestedSigil = client ? SIGILS[client.request] : null;

        if (!choice || !client || !requestedSigil) {
            console.warn("GameManager: Nenhuma escolha de análise ou cliente/sigilo inválido para processar.");
            this.state.analysisChoice = null; // Limpa a escolha para evitar loops
            this.saveGameState();
            this.uiManager.updateActionButtonBasedOnState(); // Atualiza a UI
            return;
        }

        let outcomeTitle = "Análise Concluída";
        let outcomeMessage = "";
        let sanityChange = 0;
        let moneyChange = 0;
        let playerSigilToTattoo = null; // O sigilo que o jogador "escolheu" tatuar após a análise

        switch (choice) {
            case 'correct':
                // Jogador escolheu corrigir um sigilo corrompido
                sanityChange = 5;
                outcomeMessage = "Você identificou e se propôs a corrigir o sigilo. Sua mente está mais clara.";
                playerSigilToTattoo = requestedSigil.correctVersion; // Define o sigilo correto para tatuar
                break;
            case 'accept_corrupted':
                // Jogador escolheu aceitar um sigilo corrompido
                sanityChange = -20;
                outcomeMessage = "Você decidiu seguir o pedido corrompido. O peso da decisão recai sobre sua sanidade.";
                playerSigilToTattoo = requestedSigil.id; // Define o sigilo corrompido para tatuar
                break;
            case 'refuse':
                // Jogador escolheu recusar um sigilo proibido
                sanityChange = 10;
                outcomeMessage = "Você se recusou a tatuar o símbolo proibido. Sua convicção fortalece sua mente.";
                // Não há sigilo para tatuar, o cliente pode ir embora ou ter outro desfecho
                // Neste caso, o cliente simplesmente vai embora e não há minigame.
                break;
            case 'accept_prohibited':
                // Jogador escolheu aceitar um sigilo proibido
                sanityChange = -50;
                outcomeMessage = "Você cedeu à tentação e aceitou o sigilo proibido. As consequências serão terríveis.";
                playerSigilToTattoo = requestedSigil.id; // Define o sigilo proibido para tatuar
                break;
            case 'accept_normal':
                // Jogador aceitou um sigilo normal (seguro)
                sanityChange = 0; // Geralmente não há mudança de sanidade para sigilos normais
                outcomeMessage = "Você concordou em fazer o sigilo conforme o pedido. Um trabalho direto.";
                playerSigilToTattoo = requestedSigil.id; // Define o sigilo normal para tatuar
                break;
            default:
                console.warn(`GameManager: Escolha de análise desconhecida: ${choice}`);
                outcomeMessage = "Algo inesperado aconteceu na análise.";
                break;
        }

        this.changeSanity(sanityChange);

        // Se uma recusa ocorreu, o cliente simplesmente vai embora.
        if (choice === 'refuse') {
            this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => {
                this.state.analysisChoice = null; // Limpa a escolha
                this.state.playerSigilChoice = null; // Garante que não há sigilo pendente
                this.saveGameState();
                this.advanceToNextClient(); // Avança para o próximo cliente sem minigame
            });
        } else if (playerSigilToTattoo) {
            // Se um sigilo foi selecionado para tatuar (mesmo que corrompido/proibido)
            this.state.playerSigilChoice = playerSigilToTattoo; // Define o sigilo para o minigame
            this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => {
                this.state.analysisChoice = null; // Limpa a escolha
                this.saveGameState();
                this.startMinigame(); // Inicia o minigame com o sigilo escolhido
            });
        } else {
            // Caso de fallback, se não houver sigilo para tatuar e não for recusa explícita
            this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => {
                this.state.analysisChoice = null;
                this.saveGameState();
                this.advanceToNextClient();
            });
        }
    }
}

// Ponto de entrada principal do jogo.
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.game === 'undefined') {
        window.game = new GameManager();
    }
});
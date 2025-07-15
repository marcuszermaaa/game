// js/gameCore.js
// Esta é a versão final e definitiva do GameManager, o "cérebro" do jogo.
// Ele orquestra todas as mecânicas, gerencia o estado e garante que a experiência
// do jogador seja coesa, lógica e livre de erros.

// --- IMPORTS ---
// Importa dados e classes essenciais de outros módulos.
import { CLIENTS_PER_DAY } from './constants.js';
import { ClientManager } from './managers/ClientManager.js';
import { DialogueManager } from './managers/DialogueManager.js';
import { UIManager } from './managers/UIManager.js';
import { SIGILS } from './data/sigilData.js'; 

/**
 * A classe principal do jogo, implementada como um Singleton para garantir
 * que haja apenas UMA fonte de verdade para o estado do jogo.
 */
class GameManager {
    static instance = null;
    constructor() {
        if (GameManager.instance) return GameManager.instance;
        GameManager.instance = this;
        console.log("Inicializando instância do GameManager...");

        // Mapeia os elementos HTML para acesso rápido e organizado.
        this.dom = {
            characterSprite: document.getElementById('character-sprite'),
            actionPanel: document.getElementById('action-panel'),
            eventClientName: document.getElementById('event-client-name'),
            eventDialogue: document.getElementById('event-dialogue'),
            bancada: document.getElementById('bancada'), // Referência à bancada visual
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
        
        // Inicia a cadeia de configuração do jogo.
        this.init();
    }

    /**
     * O processo de inicialização principal. A ORDEM das chamadas aqui é CRÍTICA
     * para evitar erros de referência e garantir que o jogo não congele.
     */
    init() {
        // 1. Garante que o estado do jogo (this.state) exista, seja de um save ou de um novo jogo.
        this.loadGameState();

        // 2. Com o estado já definido, cria os "gerentes" que dependem dele.
        this.instantiateManagers();

        // 3. Com os gerentes prontos, adiciona os listeners de eventos globais.
        this.bindGlobalEvents();

        // 4. Finalmente, com tudo pronto, decide o que mostrar na tela.
        this.processPendingState();
    }
    
    /**
     * Carrega o estado do jogo do `localStorage`. Se não houver, chama a configuração inicial.
     */
    loadGameState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            this.state = JSON.parse(savedState);
            this.state.purchasedUpgrades = new Set(this.state.purchasedUpgrades || []);
        } else {
            this.setupInitialState();
        }
    }

    /**
     * Define o estado inicial para um novo jogo, incluindo as flags do tutorial.
     */
    setupInitialState() {
        this.state = {
            day: 0, clientInDay: 0, sanity: 100, money: 50,
            showingTutorial: true,
            tutorialStep: 'initial_mail',
            postTutorialSequence: false, 
            playerSigilChoice: null,
            purchasedUpgrades: new Set(),
            lastOutcomeData: null,
            analysisChoice: null,
        };
        console.log("Criado novo estado de jogo inicial.");
    }

    /**
     * Cria as instâncias dos gerentes, passando as referências que eles precisam.
     */
    instantiateManagers() {
        this.clientManager = new ClientManager(this.state);
        this.dialogueManager = new DialogueManager(this.state, this);
        this.uiManager = new UIManager(this.dom, this.state, this);
    }
    
    /**
     * Salva o estado atual no localStorage. Essencial antes de qualquer navegação.
     */
    saveGameState() {
        const stateToSave = { ...this.state, purchasedUpgrades: Array.from(this.state.purchasedUpgrades) };
        localStorage.setItem('gameState', JSON.stringify(stateToSave));
    }
    
    /**
     * Adiciona listeners de eventos aos ícones do menu (Diário, Correio, Bancada).
     */
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
     * O "roteador" principal do jogo. Decide qual cena exibir com base no estado atual.
     * A ordem das verificações define a prioridade das cenas e evita conflitos visuais.
     */
    processPendingState() {
        if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
        
        // Prioridade 1: O tutorial está ativo? Se sim, renderiza a cena e para.
        if (this.state.showingTutorial) {
            this.uiManager.setupTutorialUI(this.state.tutorialStep);
            this.uiManager.updateStats();
            return;
        }

        // Prioridade 2: Estamos na tela de transição pós-tutorial? Se sim, renderiza e para.
        if (this.state.postTutorialSequence) {
            this.uiManager.showStartDayView(() => this.startFirstClientOfDay());
            return;
        }

        // Prioridade 3: Há um resultado de minigame para processar? Se sim, processa e para.
        if (this.state.lastOutcomeData) {
            this.processMinigameOutcome();
            return;
        }

        if (this.state.analysisChoice) {
            this.processAnalysisChoice();
            return;
        }

        // Se nenhuma condição especial for atendida, é o fluxo de jogo normal.
        if (!this.clientManager.hasClientsForDay(this.state.day)) {
            this.endGame("Você chegou ao fim do capítulo atual.");
            return;
        }

        // Apenas se estivermos no fluxo de jogo normal, com um cliente ativo,
        // nós atualizamos a UI completa, incluindo a bancada.
        if (this.state.day > 0 && this.state.clientInDay > 0) {
            this.uiManager.resetClientInterface();
            this.uiManager.updateActionButtonBasedOnState();
            this.uiManager.updateStats();
            this.uiManager.displayPurchasedUpgrades();
        }
    }
    
    /**
     * Centraliza o processamento do resultado do minigame. Calcula recompensas,
     * penalidades e exibe o resultado para o jogador.
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

        this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => this.advanceToNextClient());

        this.state.lastOutcomeData = null;
        this.state.playerSigilChoice = null;
        this.saveGameState();
    }

    /**
     * Chamado pelo botão "Atender Cliente". Tira o jogo do estado de espera pós-tutorial.
     */
    startFirstClientOfDay() {
        this.state.postTutorialSequence = false;
        this.advanceToNextClient();
    }
    
    /**
     * Avança para o próximo cliente do dia ou inicia a sequência de fim de dia.
     */
    advanceToNextClient() {
        // Verifica se todos os clientes do dia já foram atendidos.
        if (this.state.clientInDay >= CLIENTS_PER_DAY) {
            this.startEndDaySequence();
            return;
        }
        
        this.state.clientInDay++;
        this.state.playerSigilChoice = null; // Reseta a escolha de sigilo para o novo cliente.
        
        const nextClient = this.clientManager.getCurrentClient();
        // Verifica se o cliente deve aparecer (condições de sanidade, upgrades, etc.)
        if (this.clientManager.shouldDisplayClient(nextClient)) {
            // Re-chama o roteador principal para renderizar o novo estado do jogo com o cliente atual.
            this.processPendingState(); 
        } else {
            // Se o cliente não deve aparecer, pula para o próximo recursivamente.
            console.log(`Pulando cliente ${nextClient.id} pois as condições de aparição não foram satisfeitas.`);
            this.advanceToNextClient();
        }
        this.saveGameState();
    }

    /**
     * Salva o estado e redireciona para a tela da fase noturna.
     */
    startEndDaySequence() {
        this.saveGameState();
        window.location.href = '/night.html';
    }
    
    /**
     * Mostra a tela de fim de jogo e oferece a opção de reiniciar.
     */
    endGame(reason) {
        this.uiManager.showEndGameView(reason, () => {
            localStorage.removeItem('gameState');
            window.location.reload();
        });
    }
    
    // --- Funções de Navegação ---
    openJournal() { this.saveGameState(); window.location.href = '/journal.html'; }
    openMail() { this.saveGameState(); window.location.href = '/mail.html'; }
    openWorkbench() { this.saveGameState(); window.location.href = '/workbench.html'; }
    
    /**
     * Inicia o minigame, validando se um sigilo foi escolhido.
     */
    startMinigame() {
        if (this.state.playerSigilChoice) {
            this.saveGameState();
            window.location.href = `/minigame.html?sigil=${this.state.playerSigilChoice}`;
        } else {
            console.error("Tentativa de iniciar minigame sem um sigilo selecionado.");
            alert("ERRO: Nenhum sigilo foi selecionado para tatuar.");
        }
    }

    /**
     * Altera a sanidade do jogador e verifica a condição de derrota.
     */
    changeSanity(amount) {
        this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + amount));
        this.uiManager.updateStats();
        if (this.state.sanity <= 0) {
            this.endGame("Sua mente se despedaçou sob o peso do que viu. O abismo te consumiu.");
        }
    }

    // Funções de espaço reservado para lógicas futuras.
    startAnalysis() { /* Sua lógica de análise */ }
    processAnalysisChoice() { /* Sua lógica de análise */ }
}

// Ponto de Entrada: Cria a instância global do jogo assim que o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.game === 'undefined') {
        window.game = new GameManager();
    }
});
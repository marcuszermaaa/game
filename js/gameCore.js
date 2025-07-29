// js/gameCore.js - VERSÃO COMPLETA E ATUALIZADA COM INTEGRAÇÃO DO MINIGAME POINT & CLICK

import { CLIENTS_PER_DAY, MAX_INK } from './constants.js';
import { ClientManager } from './managers/clientManager.js';
import { DialogueManager } from './managers/DialogueManager.js';
import { UIManager } from './managers/uiManager.js';
import { SIGILS } from './data/sigilData.js';
import { MAILS } from './data/mailData.js';
import { ITENS_CRIADOS } from './data/workbenchData.js';

class GameManager {
    static instance = null;
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        GameManager.instance = this;
        console.log("GameManager: Inicializando instância singleton...");
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
        };
        this.init();
    }

    init() {
        console.log("[GameManager.init] Iniciando o GameManager...");
        this.loadGameState();
        this.instantiateManagers();
        this.bindGlobalEvents();
        this.uiManager.updateCoreUIElements(this.checkForUnreadMail());
        this.processPendingState();
        console.log("[GameManager.init] Inicialização concluída.");
    }
    
    loadGameState() {
        console.log("[GameManager.loadGameState] Tentando carregar gameState do localStorage.");
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                this.state = JSON.parse(savedState);
                console.log("[GameManager.loadGameState] Estado salvo encontrado e parseado.");

                this.state.purchasedUpgrades = new Set(Array.isArray(this.state.purchasedUpgrades) ? this.state.purchasedUpgrades : []);
                this.state.readMailIds = new Set(Array.isArray(this.state.readMailIds) ? this.state.readMailIds : []);
                this.state.discoveredSigils = new Set(Array.isArray(this.state.discoveredSigils) ? this.state.discoveredSigils : []);
                
                this.state.clientHistory = Array.isArray(this.state.clientHistory) ? this.state.clientHistory : [];
                this.state.unlockedLoreIds = Array.isArray(this.state.unlockedLoreIds) ? this.state.unlockedLoreIds : [];
                this.state.specialItems = Array.isArray(this.state.specialItems) ? this.state.specialItems : [];

                if (Array.isArray(this.state.craftingIngredients)) {
                    console.log("[GameManager.loadGameState] Convertendo formato de array de 'craftingIngredients' para objeto de contagem.");
                    const ingredientObject = {};
                    this.state.craftingIngredients.forEach(ing => {
                        ingredientObject[ing] = (ingredientObject[ing] || 0) + 1;
                    });
                    this.state.craftingIngredients = ingredientObject;
                } else if (typeof this.state.craftingIngredients !== 'object' || this.state.craftingIngredients === null) {
                    this.state.craftingIngredients = {};
                }
                
            } catch (e) {
                console.error("[GameManager.loadGameState] Erro ao carregar ou parsear gameState. Resetando para o estado inicial.", e);
                this.setupInitialState();
            }
        } else {
            console.log("[GameManager.loadGameState] Nenhum estado salvo encontrado. Configurando estado inicial.");
            this.setupInitialState();
        }
        console.log("[GameManager.loadGameState] Estado do jogo carregado:", this.state);
    }

     setupInitialState() {
        console.log("[GameManager.setupInitialState] Configurando um novo jogo do zero.");
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
            discoveredSigils: new Set(['s04']),
            craftingIngredients: {},
            craftedInks: {},
            unlockedLoreIds: [],
            specialItems: [],
        };
        this.saveGameState();
    }

    instantiateManagers() {
        console.log("[GameManager.instantiateManagers] Criando instâncias dos managers...");
        this.clientManager = new ClientManager(this.state);
        this.dialogueManager = new DialogueManager(this.state, this);
        this.uiManager = new UIManager(this.dom, this.state, this);
        console.log("[GameManager.instantiateManagers] Managers criados com sucesso.");
    }
    
    saveGameState() {
        console.log("[GameManager.saveGameState] Preparando para salvar o estado do jogo...");
        const stateToSave = { 
            ...this.state, 
            purchasedUpgrades: Array.from(this.state.purchasedUpgrades),
            readMailIds: Array.from(this.state.readMailIds),
            discoveredSigils: Array.from(this.state.discoveredSigils),
        };
        localStorage.setItem('gameState', JSON.stringify(stateToSave));
        console.log("[GameManager.saveGameState] Estado do jogo salvo no localStorage.", stateToSave);
    }
    
    bindGlobalEvents() {
        console.log("[GameManager.bindGlobalEvents] Vinculando eventos de clique aos ícones do menu.");
        this.dom.itemMail?.addEventListener('click', () => { if (this.state.tutorialStep === 'initial_letter_prompt' || !this.state.showingTutorial) this.openMail(); });
        this.dom.itemBook?.addEventListener('click', () => { if (this.state.tutorialStep === 'journal_prompt' || !this.state.showingTutorial) this.openJournal(); });
        this.dom.itemWorkbench?.addEventListener('click', () => { if (!this.state.showingTutorial) this.openWorkbench(); });
    }

    processPendingState() {
        console.log("[GameManager.processPendingState] Processando estado atual do jogo...", this.state);
        if (window.location.search) {
            console.log("[GameManager.processPendingState] Limpando parâmetros da URL.");
            window.history.replaceState(null, '', window.location.pathname);
        }
        
        // ✨ NOVA LÓGICA: VERIFICA O RESULTADO DO MINIGAME POINT & CLICK PRIMEIRO ✨
        if (this.state.pointClickResult) {
            console.log("[GameManager.processPendingState] Resultado do minigame Point & Click encontrado:", this.state.pointClickResult);
            const result = this.state.pointClickResult;
            
            this.state.sanity = result.finalSanity;
            
            if (result.success && result.foundItem) {
                if (!this.state.specialItems.includes(result.foundItem)) {
                    this.state.specialItems.push(result.foundItem);
                }
            }
            
            delete this.state.pointClickResult;
            this.saveGameState();
            
            const message = result.success ? `Você encontrou o que precisava, mas a escuridão do estúdio pesou em sua mente.` : `Você recuou da escuridão, desmaiando de exaustão mental.`;
            this.uiManager.showOutcomeView("Investigação Concluída", message, () => {
                this.processPendingState(); 
            });
            return;
        }

        if (this.state.showingTutorial) { 
            console.log("[GameManager.processPendingState] Tutorial está ativo. Entregando controle ao runTutorial().");
            this.runTutorial(); 
            return; 
        }

        if (this.state.isNewDay) { 
            console.log("[GameManager.processPendingState] Detectado novo dia. Mostrando visão de início de dia.");
            this.uiManager.showStartDayView(() => { 
                this.state.isNewDay = false; 
                this.startFirstClientOfDay(); 
            }); 
            return; 
        }
        
        const currentClient = this.clientManager.getCurrentClient();
        console.log("[GameManager.processPendingState] Cliente atual:", currentClient ? currentClient.id : "Nenhum");
        
        if (currentClient && currentClient.isNarrativeEvent) {
            console.log(`[GameManager.processPendingState] Cliente é um evento narrativo ('${currentClient.id}').`);

            if (this.isClientEventCompleted(currentClient.id)) {
                console.log(`[GameManager] Evento narrativo '${currentClient.id}' já concluído. Pulando para o estado de 'respiro'.`);
                const pauseMessage = currentClient.narrativeOutcomeText || "Você reflete sobre o encontro antes de continuar.";
                this.uiManager.showNextClientTransition(
                    pauseMessage,
                    "Aguardar próximo cliente",
                    () => {
                        this.state.clientInDay++;
                        this.saveGameState();
                        this.processPendingState();
                    }
                );
                return;
            }

            if (currentClient.id === 'vitima_armitage') {
                console.log("[GameManager.processPendingState] Lidando com o caso especial 'vitima_armitage'.");
                this.uiManager.displayNarrativeSequence(currentClient, () => {
                    this.state.clientHistory.push({ clientId: currentClient.id, day: this.state.day, outcome: 'dialogue_completed' });
                    this.saveGameState();
                    this.uiManager.showMultiOptionPanel({
                        title: "O que você faz?",
                        text: "A tatuagem parece corrompida pela intenção, não pela forma. Você pode tentar canalizar sua própria energia para purificá-la, mas isso terá um custo.",
                        options: [
                            {
                                text: "[Tentar purificar] (-15 Sanidade)",
                                callback: () => {
                                    this.changeSanity(-15);
                                    const entry = this.state.clientHistory.find(e => e.clientId === currentClient.id);
                                    if (entry) entry.outcome = 'purified_tattoo';
                                    this.uiManager.showOutcomeView("Ritual de Purificação", "Com esforço, você consegue acalmar a energia maligna na tatuagem. O pescador parece aliviado, mas o esforço o deixou abalado.", () => this.advanceToNextClient());
                                }
                            },
                            {
                                text: "[Recusar] ('Não posso ajudá-lo')",
                                style: 'danger',
                                callback: () => {
                                    const entry = this.state.clientHistory.find(e => e.clientId === currentClient.id);
                                    if (entry) entry.outcome = 'refused_help';
                                    this.uiManager.showOutcomeView("Recusa Difícil", "Você explica que não pode mexer no trabalho de outro. O homem sai, desapontado e assustado.", () => this.advanceToNextClient());
                                }
                            }
                        ]
                    });
                });
            } else {
                console.log("[GameManager.processPendingState] Lidando com evento narrativo padrão.");
                this.uiManager.displayNarrativeSequence(currentClient, () => {
                    this.state.clientHistory.push({ clientId: currentClient.id, day: this.state.day, outcome: 'narrative_completed' });
                    if (currentClient.action) this.processEventAction(currentClient.action);
                    this.saveGameState();
                    if (currentClient.action?.type === 'add_ingredient') {
                        this.uiManager.highlightWorkbenchIcon();
                    }
                    const pauseMessage = currentClient.narrativeOutcomeText || "Você reflete sobre o encontro antes de continuar.";
                    this.uiManager.showNextClientTransition(
                        pauseMessage,
                        "Aguardar próximo cliente",
                        () => {
                            this.state.clientInDay++;
                            this.saveGameState();
                            this.processPendingState();
                        }
                    );
                });
            }
            return;
        }

        if (this.state.lastOutcomeData) { console.log("[GameManager.processPendingState] Encontrado lastOutcomeData. Processando resultado do minigame."); this.processMinigameOutcome(); return; }
        if (this.state.analysisChoice) { console.log("[GameManager.processPendingState] Encontrado analysisChoice. Processando resultado da análise."); this.processAnalysisChoice(); return; }
        
        if (!currentClient) { 
            console.log("[GameManager.processPendingState] Nenhum cliente encontrado para o dia/índice atual.");
            if (!this.clientManager.hasClientsForDay(this.state.day) && this.state.day > 0) {
                console.log("[GameManager.processPendingState] Fim do conteúdo planejado. Encerrando capítulo.");
                this.endGame("Fim do capítulo.");
            } else {
                console.log("[GameManager.processPendingState] Fim dos clientes do dia. Iniciando sequência de fim de dia.");
                this.startEndDaySequence();
            }
            return; 
        }

        console.log("[GameManager.processPendingState] Nenhum estado pendente. Resetando interface para o cliente atual.");
        this.uiManager.resetClientInterface();
        this.uiManager.updateActionButtonBasedOnState();
        this.uiManager.updateStats();
    }
    
    // ✨ NOVA FUNÇÃO PARA INICIAR O MINIGAME DE EXPLORAÇÃO ✨
    startStudioExploration() {
        console.log("[GameManager] Iniciando minigame de exploração do estúdio...");
        this.saveGameState();
        window.location.href = '/pointclick.html';
    }

    isClientEventCompleted(clientId) {
        if (!this.state.clientHistory || this.state.clientHistory.length === 0) {
            return false;
        }
        return this.state.clientHistory.some(entry => entry.clientId === clientId);
    }

    processEventAction(action) {
        if (!action) return;
        console.log("[GameManager.processEventAction] Processando ação:", action);
        switch (action.type) {
            case 'add_ingredient':
                if (!this.state.craftingIngredients) this.state.craftingIngredients = {};
                const ingredientId = action.payload;
                this.state.craftingIngredients[ingredientId] = (this.state.craftingIngredients[ingredientId] || 0) + 1;
                console.log(`Ingrediente adicionado: ${ingredientId}.`);
                if (window.GameAudio) window.GameAudio.play('item_get');
                break;
            case 'add_sigil':
                if (this.state.discoveredSigils.has(action.payload)) return;
                this.state.discoveredSigils.add(action.payload);
                console.log(`Novo sigilo descoberto: ${action.payload}`);
                break;
            case 'change_sanity':
                console.log(`Ação de evento: Mudando sanidade em ${action.payload}`);
                this.changeSanity(action.payload);
                break;
            case 'unlock_lore':
                if (!this.state.unlockedLoreIds) {
                    this.state.unlockedLoreIds = [];
                }
                const loreId = action.payload;
                if (!this.state.unlockedLoreIds.includes(loreId)) {
                    this.state.unlockedLoreIds.push(loreId);
                    console.log(`[GameManager] Lore desbloqueado: ${loreId}`);
                    if (window.GameAudio) window.GameAudio.play('item_get'); 
                }
                break;
            case 'add_special_item':
                if (!this.state.specialItems) {
                    this.state.specialItems = [];
                }
                const itemId = action.payload;
                if (!this.state.specialItems.includes(itemId)) {
                    this.state.specialItems.push(itemId);
                    console.log(`[GameManager] Item Especial Adquirido: ${itemId}`);
                    if (window.GameAudio) window.GameAudio.play('item_get');
                }
                break;
        }
    }

    runTutorial() {
        console.log(`[GameManager.runTutorial] Executando passo do tutorial: ${this.state.tutorialStep}`);
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
                this.uiManager.showTutorialStep_ArmitageDialogue(this.clientManager.getCurrentClient(), () => {
                    this.uiManager.showNextClientTransition(
                        "O Professor se despede, deixando você sozinho com seus pensamentos e o pesado tomo sobre a mesa.",
                        "Continuar",
                        () => {
                            this.state.tutorialStep = 'journal_prompt'; 
                            this.saveGameState(); 
                            this.runTutorial();
                        }
                    );
                }); 
                break;
            case 'journal_prompt': 
                this.uiManager.showTutorialStep_JournalPrompt(); 
                break;
            case 'final_wait': 
                this.uiManager.showTutorialStep_FinalWait(() => { 
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
        console.log("[GameManager.processMinigameOutcome] Processando resultado do minigame...", this.state.lastOutcomeData);
        const outcome = this.state.lastOutcomeData;
        const client = this.clientManager.getCurrentClient();
        if (!outcome || !client) { 
            console.warn("[GameManager.processMinigameOutcome] Dados de resultado ou cliente ausentes. Limpando e avançando.");
            this.state.lastOutcomeData = null; 
            this.saveGameState(); 
            this.advanceToNextClient(); 
            return; 
        }
        
        let moneyChange = 0;
        let sanityChange = 0;
        let outcomeTitle = "";
        let baseOutcomeMessage = "";
        let clientOutcome = '';
        const isCorrectSigil = (this.state.playerSigilChoice === client.correctSigil);

        const maxErrorThreshold = 1; 
        const accuracyModifier = Math.max(0.4, 1 - (outcome.accuracy / maxErrorThreshold));
        let accuracyNote = "";
        console.log(`[GameManager.processMinigameOutcome] Calculando precisão: Erro=${outcome.accuracy}, Modificador de Pagamento=${accuracyModifier}`);

        if(outcome.success) {
            if (accuracyModifier < 0.65) {
                accuracyNote = "\n\nO trabalho ficou um pouco borrado e impreciso, o que não agradou totalmente o cliente.";
            } else if (accuracyModifier >= 0.98) {
                accuracyNote = "\n\nAs linhas estão perfeitas, um trabalho de mestre que impressionou o cliente.";
                sanityChange += 2; 
            }
        }

        let paymentModifier = 1.0;
        let methodNote = "";

        if (outcome.method === 'blood') {
            paymentModifier = 0.5;
            sanityChange -= 10;
            methodNote = "\n\nA tatuagem foi feita com seu próprio sangue. O resultado é poderoso, mas instável e perturbador.";
        } else if (outcome.method === 'tintaDaClarividencia') {
            methodNote = "\n\nA Tinta da Clarividência amplificou o resultado...";
        } else if (outcome.method && outcome.method !== 'normal') {
            methodNote = `\n\nA tatuagem foi feita com uma Tinta Especial.`;
        }

        if (outcome.success) {
            if (isCorrectSigil) {
                outcomeTitle = "Trabalho Impecável";
                moneyChange = client.successPay * paymentModifier * accuracyModifier;
                sanityChange += 5;
                baseOutcomeMessage = `O sigilo correto foi desenhado.`;
                clientOutcome = 'success';
                if (outcome.method === 'tintaDaClarividencia') {
                    moneyChange *= 1.25;
                    sanityChange += 5;
                }
            } else { 
                outcomeTitle = "Erro de Julgamento"; 
                moneyChange = client.wrongPay; 
                sanityChange -= 15; 
                baseOutcomeMessage = `Sua mão foi firme, mas o sigilo era o errado. Consequências inesperadas podem surgir...`;
                clientOutcome = 'wrong_sigil';
            }
        } else { 
            outcomeTitle = "Mão Trêmula"; 
            moneyChange = client.failPay; 
            sanityChange -= 10;
            baseOutcomeMessage = `Você falhou em completar o desenho. O cliente está insatisfeito.`;
            clientOutcome = 'fail_minigame';
            if (outcome.method === 'tintaDaClarividencia') {
                sanityChange -= 10;
            }
        }
        
        const finalOutcomeMessage = baseOutcomeMessage + accuracyNote + methodNote;
        
        this.state.money += moneyChange;
        this.changeSanity(sanityChange);
        
        this.state.clientHistory.push({ 
            clientId: client.id, day: this.state.day, sigilTattooed: this.state.playerSigilChoice, 
            outcome: clientOutcome, method: outcome.method,
            notes: finalOutcomeMessage, payment: moneyChange, sanityChange: sanityChange 
        });

        this.state.lastOutcomeData = null;
        this.state.playerSigilChoice = null;
        this.saveGameState();
        this.uiManager.showOutcomeView(outcomeTitle, finalOutcomeMessage, () => this.advanceToNextClient());
    }

    startFirstClientOfDay() { 
        console.log("[GameManager.startFirstClientOfDay] Iniciando o primeiro cliente do dia.");
        this.uiManager.setIconsLocked(false);
        this.state.clientInDay = 1; 
        this.saveGameState(); 
        this.processPendingState(); 
    }
    
    advanceToNextClient() {
        console.log("[GameManager.advanceToNextClient] Avançando para o próximo cliente.");
        this.uiManager.setIconsLocked(false);
        const totalClientsForToday = this.clientManager.getClientsForDay(this.state.day).length;
        console.log(`[GameManager.advanceToNextClient] Clientes atendidos: ${this.state.clientInDay}, Total para hoje: ${totalClientsForToday}`);
        
        if (this.state.clientInDay >= totalClientsForToday) {
            this.startEndDaySequence();
            return;
        }

        this.state.clientInDay++;
        this.state.playerSigilChoice = null;
        this.state.analysisChoice = null; 
        this.saveGameState();

        if (this.clientManager.getCurrentClient()) {
            this.processPendingState();
        } else {
            this.startEndDaySequence();
        }
    }

    startEndDaySequence() { 
        console.log("[GameManager.startEndDaySequence] Fim do dia. Preparando para a tela da noite.");
        this.state.playerSigilChoice = null;
        this.state.analysisChoice = null;
        this.state.isNewDay = true; 
        this.saveGameState(); 
        window.location.href = '/night.html'; 
    }

    endGame(reason) { 
        console.log(`[GameManager.endGame] Fim do jogo acionado. Motivo: ${reason}`);
        this.uiManager.showEndGameView(reason, () => { 
            localStorage.removeItem('gameState'); 
            window.location.reload(); 
        }); 
    }
    
    openJournal() { console.log("[GameManager] Abrindo o Diário."); this.saveGameState(); window.location.href = '/journal.html'; }
    openMail() { console.log("[GameManager] Abrindo a Caixa de Correio."); this.saveGameState(); window.location.href = '/mail.html'; }
    openWorkbench() { console.log("[GameManager] Abrindo a Bancada de Trabalho."); this.saveGameState(); window.location.href = '/workbench.html'; }
    
    startMinigame() {
        if (!this.state.playerSigilChoice) { console.error("[GameManager.startMinigame] Tentativa de iniciar minigame sem um sigilo escolhido."); return; }
        console.log(`[GameManager.startMinigame] Iniciando minigame para o sigilo: ${this.state.playerSigilChoice}`);
        
        const temTintasEspeciais = this.state.craftedInks && Object.values(this.state.craftedInks).some(q => q > 0);

        if (this.state.inkCharges > 0) {
            this.state.inkCharges--;
            this.uiManager.updateStats(); 
            this.saveGameState();
            window.location.href = `/minigame.html`;
        } else if (temTintasEspeciais) {
            this.useSpecialInk();
        } else {
            this.uiManager.showMultiOptionPanel({
                title: "Tinta Esgotada!",
                text: "Você não tem mais tinta espectral. O que você faz?",
                options: [
                    { 
                        text: "Dispensar cliente e encerrar o dia", 
                        callback: () => {
                            this.changeSanity(-5);
                            const client = this.clientManager.getCurrentClient();
                            this.state.clientHistory.push({ clientId: client.id, day: this.state.day, outcome: 'dispensed_no_ink', notes: 'Dispensado por falta de tinta.' });
                            this.startEndDaySequence();
                        }
                    },
                    { 
                        text: "Usar meu próprio sangue... (-25 Sanidade)", 
                        style: 'danger', 
                        callback: () => this.performBloodTattoo() 
                    }
                ]
            });
        }
    }

    useSpecialInk() {
        console.log("[GameManager.useSpecialInk] Sem tinta normal, mas tintas especiais estão disponíveis. Mostrando opções.");
        const availableInks = Object.keys(this.state.craftedInks).filter(id => this.state.craftedInks[id] > 0);
        const inkOptions = availableInks.map(inkId => {
            const inkName = ITENS_CRIADOS[inkId]?.name || inkId; 
            return {
                text: `Usar ${inkName}`,
                callback: () => {
                    console.log(`[GameManager.useSpecialInk] Usando a tinta: ${inkId}`);
                    this.state.craftedInks[inkId]--;
                    this.state.specialInkActive = inkId;
                    this.saveGameState();
                    window.location.href = `/minigame.html`;
                }
            };
        });
        inkOptions.push({
            text: "Não, obrigado. Deixe para lá.",
            style: 'danger',
            callback: () => { console.log("[GameManager.useSpecialInk] Jogador decidiu não usar a tinta especial."); }
        });
        this.uiManager.showMultiOptionPanel({
            title: "Tinta Especial Disponível",
            text: "Você não tem tinta espectral, mas possui outras misturas em seu inventário. Deseja usar uma?",
            options: inkOptions
        });
    }

    performBloodTattoo() {
        console.log("[GameManager.performBloodTattoo] Realizando a tatuagem de sangue!");
        this.changeSanity(-25);
        this.state.bloodTattooActive = true;
        this.saveGameState();
        window.location.href = `/minigame.html`;
    }
    
    changeSanity(amount) {
        console.log(`[GameManager.changeSanity] Alterando sanidade. Valor atual: ${this.state.sanity}, Mudança: ${amount}`);
        this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + amount));
        this.uiManager.updateStats();
        if (this.state.sanity <= 0) {
            this.endGame("Sua mente se despedaçou sob o peso do que viu."); 
        }
    }

    checkForUnreadMail() {
        if (!MAILS || !Array.isArray(MAILS)) return false;
        const receivedMails = MAILS.filter(mail => mail.receivedDay <= this.state.day);
        const readMailIds = new Set(this.state.readMailIds || []);
        const hasUnread = receivedMails.some(mail => !readMailIds.has(mail.id));
        console.log(`[GameManager.checkForUnreadMail] Verificação de e-mail não lido: ${hasUnread}`);
        return hasUnread;
    }

    startAnalysisProcess() {
        const currentClient = this.clientManager.getCurrentClient();
        if (!currentClient || !currentClient.request) return;
        console.log(`[GameManager.startAnalysisProcess] Iniciando análise para o cliente ${currentClient.id}`);
        const clientsForToday = this.clientManager.getClientsForDay(this.state.day);
        const clientIndex = clientsForToday.findIndex(c => c.id === currentClient.id);
        if (clientIndex === -1) { 
            console.error("[GameManager.startAnalysisProcess] Não foi possível encontrar o índice do cliente atual para análise.");
            return; 
        }
        this.saveGameState();
        window.location.href = `/analysis.html?clientIndex=${clientIndex}&day=${this.state.day}`;
    }

    processAnalysisChoice() {
        console.log("[GameManager.processAnalysisChoice] Processando resultado da análise...", this.state.analysisChoice);
        const choice = this.state.analysisChoice;
        const client = this.clientManager.getCurrentClient();
        const requestedSigil = client ? SIGILS[client.request] : null;

        if (!choice || !client || !requestedSigil) {
            console.warn("[GameManager.processAnalysisChoice] Dados de escolha, cliente ou sigilo ausentes. Limpando e continuando.");
            this.state.analysisChoice = null; this.saveGameState(); this.processPendingState();
            return;
        }

        let outcomeTitle = "Análise Concluída", outcomeMessage = "", sanityChange = 0, playerSigilToTattoo = null, clientOutcome = ''; 

        switch (choice) {
            case 'correct':
                sanityChange = 5; outcomeMessage = "Você identificou e se propôs a corrigir o sigilo.";
                playerSigilToTattoo = requestedSigil.correctVersion; clientOutcome = 'corrected_sigil';
                const correctSigilId = requestedSigil.correctVersion;
                if (!this.state.discoveredSigils.has(correctSigilId)) {
                    this.state.discoveredSigils.add(correctSigilId);
                    const learnedSigilName = SIGILS[correctSigilId]?.name || "um sigilo";
                    outcomeMessage += `\n\n[NOVO SIGILO APRENDIDO: "${learnedSigilName}"]`;
                }
                break;
            case 'accept_corrupted':
                sanityChange = -20; outcomeMessage = "Você decidiu seguir o pedido corrompido.";
                playerSigilToTattoo = requestedSigil.id; clientOutcome = 'accepted_corrupted';
                break;
            case 'refuse':
                sanityChange = 10; outcomeMessage = "Você se recusou a tatuar o símbolo proibido.";
                clientOutcome = 'refused_prohibited';
                break;
            case 'accept_prohibited':
                sanityChange = -50; outcomeMessage = "Você cedeu à tentação e aceitou o sigilo proibido.";
                playerSigilToTattoo = requestedSigil.id; clientOutcome = 'accepted_prohibited';
                break;
            case 'accept_normal':
                outcomeMessage = "Você concordou em fazer o sigilo conforme o pedido.";
                playerSigilToTattoo = requestedSigil.id; clientOutcome = 'accepted_normal';
                break;
            default:
                outcomeMessage = "Algo inesperado aconteceu."; clientOutcome = 'unknown_analysis_outcome';
                break;
        }

        this.changeSanity(sanityChange);
        this.state.clientHistory.push({ clientId: client.id, day: this.state.day, analysisChoice: choice, sigilTattooed: playerSigilToTattoo, outcome: clientOutcome, notes: outcomeMessage, payment: 0, sanityChange: sanityChange });
        this.state.analysisChoice = null;

        if (choice === 'refuse') {
            this.state.playerSigilChoice = null; this.saveGameState();
            this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => { this.advanceToNextClient(); });
        } else if (playerSigilToTattoo) {
            this.state.playerSigilChoice = playerSigilToTattoo; this.saveGameState();
            this.uiManager.showOutcomeView(outcomeTitle, outcomeMessage, () => { 
                this.uiManager.setIconsLocked(false);
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
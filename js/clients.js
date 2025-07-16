// js/clients.js - Contém a lógica principal do jogo e a classe Game (GameManager).
// Refatorado para delegar tarefas de dados e UI a managers específicos.

// --- IMPORTS DE MÓDULOS DE DADOS ---
import { CLIENTS } from '../js/data/clientData.js'; // Dados dos clientes.
import { DIALOGUES } from '../js/data/dialogueData.js'; // Dados dos diálogos.
import { SIGILS } from './constants.js'; // Definições de sigilos.
// Importa outras constantes globais necessárias.
import { IS_TOUCH_DEVICE, CHARACTER_SPRITE_URLS, CLIENT_TRANSITION_BACKGROUND } from './constants.js';
// Importa MAILS se não estiver em constants.js e for necessário aqui.
// import { MAILS } from './mailData.js';

// --- IMPORTS DE GERENCIADORES ---
import { ClientManager } from './managers/ClientManager.js';
import { DialogueManager } from './managers/DialogueManager.js';
import { UIManager } from './managers/uiManager.js'; // Nosso novo gerente de UI.

// --- IMPORTS DE UTILIDADES DE ÁUDIO (SE ESTIVEREM EM ARQUIVO SEPARADO) ---
// import { AudioUtils } from './audioUtils.js';

/**
 * Classe principal que gerencia o estado do jogo, a interface do usuário,
 * o fluxo de eventos e a orquestração geral de todos os componentes.
 * Funciona como o GameManager.
 */
class Game {
    /**
     * Inicializa a instância do Jogo. Implementa o padrão Singleton.
     */
    constructor() {
        if (Game.instance) return Game.instance;
        Game.instance = this;

        console.log("Inicializando a classe Game (GameManager)...");

        // --- REFERÊNCIAS AOS ELEMENTOS DOM ---
        this.dom = {
            characterSprite: document.getElementById('character-sprite'),
            eventClientName: document.getElementById('event-client-name'),
            eventDialogue: document.getElementById('event-dialogue'),
            dayStat: document.getElementById('day-stat'),
            clientStat: document.getElementById('client-clientStat'), // Corrigido ID para 'client-stat' conforme UI
            moneyValue: document.getElementById('money-value'),
            itemBook: document.getElementById('item-book'),
            itemWorkbench: document.getElementById('item-workbench'),
            itemMail: document.getElementById('item-mail'),
            shakyCursor: document.getElementById('shaky-cursor'),
            screenEffectOverlay: document.getElementById('screen-effect-overlay'),
            mainViewDynamic: document.getElementById('main-view-dynamic'),
            eventHeader: document.getElementById('event-header'),
            eventBackground: document.getElementById('event-background'),
            eventPanel: document.getElementById('event-panel'),
            characterPanel: document.getElementById('character-panel'),
            gameBackground: document.getElementById('game-background'),
            gameLayout: document.getElementById('game-layout'),
            itemBar: document.getElementById('item-bar'),
            statusBar: document.getElementById('status-bar'),
            centroStatus: document.getElementById('CENTRO_STATUS'),
        };

        // --- REFERÊNCIAS AOS ELEMENTOS DE ÁUDIO ---
        this.audioElements = {
            introMusic: document.getElementById('splash-music'),
            loreMusic: document.getElementById('lore-music'),
            gameBgMusic: document.getElementById('bg-music'),
            tattooMusic: document.getElementById('tattoo-music'),
            criticalMusic: document.getElementById('critical-music'),
            nightPhaseMusic: document.getElementById('save-music'),
            successSfx: document.getElementById('success-sfx'),
            errorSfx: document.getElementById('error-sfx'),
        };

        // --- ESTADO DO JOGO ---
        this.state = null;

        // --- CONFIGURAÇÕES GLOBAIS DO JOGO ---
        this.lowSanityThreshold = 40;
        this.clientCountPerDay = 3;

        // --- GERENCIADORES ---
        // Instanciados após o estado ser configurado.
        this.clientManager = null;
        this.dialogueManager = null;
        this.uiManager = null; // Instância do UIManager.

        // 1. Carrega o estado do jogo ou prepara um novo.
        this.loadGameStateFromStorage();

        const urlParams = new URLSearchParams(window.location.search);
        const isNewGameInitiated = urlParams.get('newGame') === 'true';

        if (isNewGameInitiated || !this.state) {
            console.log("Configurando estado inicial para novo jogo...");
            this.state = {
                sanity: 100, money: 5000, day: 1, clientInDay: 1, currentClientIndex: 0,
                playerSigilChoice: null, shakeMultiplier: 1.0, sanityPerClient: 0,
                purchasedUpgrades: new Set(), tattooFailureChanceModifier: 0,
                activeMusic: null, maxSanity: 100,
                foundDoorNote: false, unlockedLocations: new Set(), obtainedClues: new Set(),
                lastClientAttended: null, lastOutcomeData: { outcome: null, sigil: null, choiceCorrect: null },
                lastSigilUsed: null, lastSigilChoiceCorrect: null,
                // Tutorial state:
                showingTutorial: true,
                tutorialStep: 'initial_mail',
                readMailIds: [], // Para rastrear e-mails lidos no tutorial.
            };
            this.saveGameState();
        } else {
            console.log("Estado do jogo carregado com sucesso do localStorage.");
            this.state.purchasedUpgrades = new Set(this.state.purchasedUpgrades);
            if (!this.state.readMailIds) this.state.readMailIds = [];
        }

        // 2. Instancia os gerentes, passando o estado e referências necessárias.
        this.clientManager = new ClientManager(this.state);
        this.dialogueManager = new DialogueManager(this.state);
        // Instancia o UIManager, passando todas as referências que ele precisa.
        this.uiManager = new UIManager(this.dom, this.audioElements, this.state, this.clientManager, this.dialogueManager);

        // 3. Inicializa a interface do jogo e os listeners de eventos.
        this.initializeGame();
    }

    /**
     * Tenta carregar o estado do jogo salvo do localStorage.
     * @returns {boolean} True se o estado foi carregado com sucesso.
     */
    loadGameStateFromStorage() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                const loadedState = JSON.parse(savedState);
                if (typeof loadedState.day === 'number' && typeof loadedState.money === 'number' && typeof loadedState.sanity === 'number' && Array.isArray(loadedState.purchasedUpgrades)) {
                    this.state = loadedState;
                    console.log("Estado do jogo encontrado no localStorage.");
                    return true;
                } else {
                    console.error("Estado do jogo carregado é inválido. Removendo save corrompido.");
                    localStorage.removeItem('gameState');
                    this.state = null;
                    return false;
                }
            } catch (e) {
                console.error("Erro ao fazer parse do estado do jogo salvo:", e);
                localStorage.removeItem('gameState');
                this.state = null;
                return false;
            }
        }
        console.log("Nenhum estado de jogo salvo encontrado.");
        this.state = null;
        return false;
    }

    /**
     * Salva o estado atual do jogo no localStorage.
     */
    saveGameState() {
        const stateToSave = {
            ...this.state,
            purchasedUpgrades: Array.from(this.state.purchasedUpgrades),
        };
        try {
            localStorage.setItem('gameState', JSON.stringify(stateToSave));
            console.log("Estado do jogo salvo.");
        } catch (e) {
            console.error("Erro ao salvar estado do jogo no localStorage:", e);
        }
    }

    /**
     * Inicializa a interface do jogo e configura o estado inicial.
     */
    initializeGame() {
        console.log("Executando initializeGame()");

        // Adiciona listeners para ícones da barra de menu.
        this.addJournalClickListener();
        this.addMailClickListener();

        // Aplica quaisquer destaques visuais iniciais.
        this.applyInitialHighlights();

        // Configura a UI com base no estado atual (tutorial ou jogo normal).
        if (this.state.showingTutorial) {
            console.log(`Estado indica tutorial ativo. Tutorial Step: ${this.state.tutorialStep}`);
            this.uiManager.setupTutorialUI(this.state.tutorialStep); /* Delega a configuração da UI do tutorial ao UIManager. */
        } else {
            console.log("Estado NÃO indica tutorial. Processando estados pendentes e carregando cliente.");
            this.processPendingState();
            this.loadClient();
        }

        // Atualiza estatísticas e aplica efeitos de sanidade.
        this.updateStats();
        this.applySanityEffects();

        // Adiciona classes ao body para estilos responsivos.
        if (IS_TOUCH_DEVICE) document.body.classList.add('touch-device');
        else document.body.classList.add('desktop');
    }

    /**
     * Aplica destaques visuais aos ícones da barra de menu conforme o estado.
     */
    applyInitialHighlights() {
        console.log("Aplicando destaques iniciais...");
        const mailItemElement = this.dom.itemMail;
        const bookItemElement = this.dom.itemBook;

        // Destaque para o Mail:
        if (mailItemElement) {
            if (this.state.showingTutorial && this.state.tutorialStep === 'initial_mail' && !this.state.readMailIds.includes('letter1')) {
                console.log("Aplicando highlight no item-mail (Tutorial: Ler carta).");
                mailItemElement.classList.add('highlight-pulse');
            } else if (this.state.hasNewMail && !this.state.showingTutorial) { // Assumindo que 'hasNewMail' é uma flag atualizada em outro lugar.
                console.log("Aplicando highlight no item-mail (Novas cartas pendentes).");
                mailItemElement.classList.add('highlight-pulse');
            } else {
                mailItemElement.classList.remove('highlight-pulse');
            }
        }

        // Destaque para o Diário:
        if (bookItemElement) {
            let shouldHighlightBook = false;
            if (this.state.showingTutorial && this.state.tutorialStep === 'read_mail_then_diary') {
                shouldHighlightBook = true;
            } else if (!this.state.showingTutorial && this.dom.actionPanel && this.dom.actionPanel.innerHTML.includes('journal-btn')) {
                shouldHighlightBook = true;
            }

            if (shouldHighlightBook) {
                console.log("Aplicando highlight no item-book (Diário).");
                bookItemElement.classList.add('highlight-pulse');
            } else {
                bookItemElement.classList.remove('highlight-pulse');
            }
        }
    }

    /**
     * Processa quaisquer estados pendentes (parâmetros de URL, escolhas salvas)
     * após uma transição de página ou evento.
     */
    processPendingState() {
        console.log("Executando processPendingState()");
        const urlParams = new URLSearchParams(window.location.search);

        // --- Processa resultado de minigame ---
        const minigameResult = urlParams.get('minigameResult');
        if (minigameResult) {
            console.log("Resultado de minigame detectado na URL:", minigameResult);
            // A lógica de processamento do resultado (dinheiro, sanidade, UI) é feita
            // pela própria página do minigame antes de retornar.
            // Aqui, apenas limpamos os parâmetros da URL.
            window.history.replaceState(null, '', window.location.pathname);
            // O resultado em si será exibido quando loadClient() for chamado e processar lastOutcomeData.
            // Se o resultado for um fim de cliente, pode chamar showNextClientButton() diretamente.
            // Assumindo que o resultado já foi tratado e salvo em lastOutcomeData.
            // Precisamos garantir que a UI correta seja mostrada.
            // O `loadClient` ou `handleEndOfDaySequence` devem verificar `lastOutcomeData`.
            // Por enquanto, vamos processar a lógica de saída do minigame.
            const success = minigameResult === 'success'; // Exemplo, pode ser mais complexo.
            // A chamada para mostrar o resultado final e avançar será feita após o processamento.
            // O `loadClient` ou `handleEndOfDaySequence` deve lidar com a exibição do `lastOutcomeData`.
            return;
        }

        // --- Processa seleção de sigilo do Diário ---
        const sigilIdFromJournal = urlParams.get('selectedSigil');
        if (sigilIdFromJournal) {
            console.log("Sigilo selecionado no diário detectado na URL:", sigilIdFromJournal);
            const client = this.clientManager.getClientByIndex(this.state.currentClientIndex);
            if (client) {
                this.state.playerSigilChoice = sigilIdFromJournal;

                /* ATUALIZAÇÃO DO TUTORIAL APÓS SELEÇÃO DE SIGILO */
                if (this.state.showingTutorial && this.state.tutorialStep === 'read_mail_then_diary') {
                    console.log("Tutorial: Jogador selecionou sigilo do Diário. Avançando para 'game_start'.");
                    this.state.tutorialStep = 'game_start';
                    if (this.dom.itemBook) this.dom.itemBook.classList.remove('highlight-pulse');
                }
                this.saveGameState();
                window.history.replaceState(null, '', window.location.pathname);
                this.updateActionButtonBasedOnState(); /* Atualiza botão para "Iniciar Jogo". */
            } else {
                console.error("Erro: Cliente inválido ao processar 'selectedSigil'.");
                window.history.replaceState(null, '', window.location.pathname);
            }
            return;
        }

        // --- Processa escolha de análise pendente ---
        if (this.state.analysisChoice) {
            console.log("Análise pendente detectada no estado do jogo:", this.state.analysisChoice);
            const choice = this.state.analysisChoice;
            const clientIndex = this.state.currentClientIndex;
            const currentClient = this.clientManager.getClientByIndex(clientIndex);

            if (currentClient) {
                const sanityChange = this.dialogueManager.processDialogueAction(choice);
                this.changeSanity(sanityChange); // Aplica a mudança de sanidade.

                let message = "";
                let outcomeType = "";

                switch (choice) {
                    case 'correct': message = `Você analisou corretamente. A ânsia por conhecimento é um fardo que vale a pena carregar. Ganhou +${sanityChange} Sanidade.`; outcomeType = 'correct_analysis'; break;
                    case 'accept_corrupted': message = `Você decidiu prosseguir com o sigilo corrompido. O abismo sussurra de volta. Ganhou -${Math.abs(sanityChange)} Sanidade.`; outcomeType = 'accept_corrupted_analysis'; break;
                    case 'refuse': message = `Você recusou a tarefa perigosa. Um ato de sabedoria, talvez. Ganhou +${sanityChange} Sanidade.`; outcomeType = 'refuse_analysis'; break;
                    case 'accept_prohibited': message = `Você ignorou os avisos e tatuou o sigilo proibido. O preço é alto. Ganhou -${Math.abs(sanityChange)} Sanidade.`; outcomeType = 'accept_prohibited_analysis'; break;
                    case 'accept_normal': message = `Você seguiu o procedimento padrão. Sem surpresas, sem custo. Ganhou ${sanityChange} Sanidade.`; outcomeType = 'accept_normal_analysis'; break;
                    default: message = "Uma escolha estranha foi feita...";
                }

                this.state.lastOutcomeData = { outcome: outcomeType, sigil: null, choiceCorrect: null };
                this.state.analysisChoice = null;
                this.saveGameState();
                window.history.replaceState(null, '', window.location.pathname);

                // Exibe a visão de resultado com um callback para avançar.
                const nextActionCallback = () => this.loadNextClient();
                this.uiManager.showOutcomeView(`Resultado da Análise`, message, outcomeType, nextActionCallback);
            } else {
                console.error("Cliente inválido para processar análise pendente.");
                this.state.analysisChoice = null;
                this.saveGameState();
                window.history.replaceState(null, '', window.location.pathname);
            }
            return;
        }

        // --- Tratamento Pós-Retorno do Mail/Journal (se nada da URL foi processado) ---
        if (this.state.showingTutorial) {
            console.log(`Retorno para game.html no tutorial. Tutorial Step: ${this.state.tutorialStep}`);
            this.uiManager.setupTutorialUI(this.state.tutorialStep); /* Delega a UI do tutorial ao UIManager. */
            return;
        }

        // Se não estamos em tutorial e nada mais foi processado, carregamos o cliente.
        if (!this.state.showingTutorial) {
            console.log("Não estamos em tutorial. Carregando cliente...");
            this.loadClient();
        }
    }

    /**
     * Carrega o cliente atual para a tela principal.
     * Determina se deve iniciar um diálogo ou exibir o problema do cliente diretamente.
     */
    loadClient() {
        console.log("GameManager: Executando loadClient()");

        if (this.state.showingTutorial) {
            console.log("Não carregando cliente pois 'showingTutorial' é true.");
            return;
        }
        // Busca o cliente usando o ClientManager.
        const client = this.clientManager.getClientByIndex(this.state.currentClientIndex);
        if (!client) {
            console.error("Cliente não encontrado para o índice", this.state.currentClientIndex);
            this.endGame();
            return;
        }

        console.log(`Carregando cliente: ${client.name} (Índice: ${this.state.currentClientIndex})`);

        // --- Lógica para iniciar o diálogo, se necessário ---
        const clientDialogueConfig = this.dialogueManager.getDialoguesForClient(client.id);
        if (clientDialogueConfig && clientDialogueConfig.initial && !this.state.currentDialogueNode && !this.state.playerSigilChoice) {
            console.log("Iniciando diálogo para o cliente:", client.name);
            const initialNode = this.dialogueManager.startDialogueFor(client.id);
            if (initialNode) {
                this.uiManager.displayDialogue(initialNode, client); /* Delega a exibição do diálogo ao UIManager. */
                return;
            }
        }
        /* Se já estamos em um diálogo com este cliente (continuação). */
        else if (this.state.currentDialogueNode && this.state.currentDialogueNode.startsWith(client.id)) {
            const currentNodeKey = this.state.currentDialogueNode.split('_').slice(1).join('_');
            const currentNodeData = this.dialogueManager.getDialogueNode(client.id, currentNodeKey);
            if (currentNodeData) {
                console.log("Continuando diálogo para o cliente:", client.name, "no nó:", currentNodeKey);
                this.uiManager.displayDialogue(currentNodeData, client); /* Delega a exibição do diálogo. */
            } else {
                console.error("Nó de diálogo ativo não encontrado para continuação:", this.state.currentDialogueNode);
                this.handleDialogueEnd();
            }
            return;
        }
        /* --- Fim da Lógica de Diálogo --- */

        /* Se não há diálogo para iniciar/continuar, reseta a interface para o estado de cliente normal. */
        this.resetClientInterface();
    }

    /**
     * Restaura a interface do jogo para exibir o cliente atual normalmente.
     */
    resetClientInterface() {
        console.log("GameManager: Resetando interface para modo cliente.");
        if (this.state.showingTutorial) {
            console.log("Não resetando interface do cliente pois 'showingTutorial' é true.");
            return;
        }
        const client = this.clientManager.getClientByIndex(this.state.currentClientIndex);
        if (!client) {
            console.log("Não resetando interface do cliente pois o índice é inválido.");
            return;
        }

        /* Delega a atualização do sprite do personagem ao UIManager. */
        if (!this.state.currentDialogueNode) {
            this.uiManager.updateCharacterSprite(client);
        } else {
            /* Se em diálogo, UIManager já cuidou disso. Garante que esteja visível. */
            if (this.dom.characterSprite) this.dom.characterSprite.style.display = '';
        }

        /* Delega a atualização de nome e problema do cliente ao UIManager. */
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = client.name;
        if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = this.clientManager.getClientProblemText(client.id);
        if (this.dom.eventDialogue) this.dom.eventDialogue.style.display = '';
        if (this.dom.eventPanel) this.dom.eventPanel.style.display = '';

        /* Limpa o painel de ação. */
        if (this.dom.actionPanel) this.dom.actionPanel.innerHTML = '';

        /* Se saímos de um diálogo, limpamos o estado do diálogo. */
        if (this.state.currentDialogueNode) {
            this.state.currentDialogueNode = null;
            this.saveGameState();
        }

        this.updateStats(); /* Atualiza estatísticas. */
        this.updateActionButtonBasedOnState(); /* Atualiza os botões de ação. */
    }

    /**
     * Avança para o próximo cliente, gerenciando transições de dia, capítulo e fim de jogo.
     */
    loadNextClient() {
        console.log("GameManager: Executando loadNextClient()");
        if (this.state.showingTutorial) {
            console.log("Não avançando cliente pois 'showingTutorial' é true.");
            return;
        }

        this.state.currentClientIndex++; /* Avança para o próximo índice. */
        const totalClientsAttended = this.state.currentClientIndex;
        const clientsPerDay = this.state.clientCountPerDay;

        /* Verifica se todos os clientes foram atendidos. */
        if (totalClientsAttended >= CLIENTS.length) {
            console.log("Todos os clientes atendidos. Encerrando jogo.");
            this.endGame();
            return;
        }

        /* Verifica se é hora de avançar para a fase noturna. */
        if ((totalClientsAttended % clientsPerDay) === 0) {
            console.log(`Completados ${clientsPerDay} clientes do dia ${this.state.day}. Indo para a fase noturna.`);
            this.state.day++;
            this.state.clientInDay = 1;
            this.handleEndOfDaySequence(); /* Prepara a transição para a fase noturna/início do novo dia. */
        } else {
            /* Carrega o próximo cliente do mesmo dia. */
            this.state.clientInDay = (totalClientsAttended % clientsPerDay) + 1;
            console.log(`Carregando próximo cliente do dia ${this.state.day}. Cliente ${this.state.clientInDay}/${clientsPerDay}.`);

            /* Reseta variáveis específicas para o próximo cliente. */
            this.state.playerSigilChoice = null;
            this.state.currentDialogueNode = null;
            this.loadClient();
            this.saveGameState();
        }
    }

    /**
     * Sequência que ocorre após o fim de um dia de clientes ou após o término do tutorial.
     * Prepara a UI para o início do dia / primeiro cliente.
     */
    handleEndOfDaySequence() {
        console.log("GameManager: Entrando na sequência pós-tutorial / fim de dia.");

        /* Finaliza o tutorial se ele estava ativo. */
        if (this.state.showingTutorial) {
            console.log("Tutorial concluído. Preparando para o primeiro cliente.");
            this.state.showingTutorial = false;
            this.state.tutorialStep = 'game_start';
        }

        /* Prepara a UI usando o UIManager. */
        // Configura o diálogo de introdução ao novo dia/cliente.
        if (this.dom.eventDialogue) {
            this.dom.eventDialogue.innerHTML = `
                <p>Seu primeiro cliente do dia está entrando no estúdio.</p>
                <p>Sua aparência é incomum, e um ar de mistério o cerca.</p>
            `;
            this.dom.eventDialogue.style.display = '';
        }
        if (this.dom.eventClientName) this.dom.eventClientName.style.display = '';
        if (this.dom.clientStat) this.dom.clientStat.style.display = '';

        /* Aplica o background de transição/sombra ao character-sprite via UIManager. */
        if (this.dom.characterSprite) {
            this.dom.characterSprite.style.backgroundImage = `url('${CLIENT_TRANSITION_BACKGROUND}')`;
            this.dom.characterSprite.style.display = '';
        }

        /* Define o botão de ação para iniciar o atendimento. */
        this.uiManager.updateActionButton({
            id: 'attend-client-btn',
            text: 'Atender Cliente',
            onClick: () => {
                console.log("Clicado em 'Atender Cliente'. Carregando o primeiro cliente real.");
                /* Antes de carregar o cliente, reseta o sprite. */
                if (this.dom.characterSprite) {
                    this.dom.characterSprite.style.backgroundImage = '';
                    this.dom.characterSprite.style.display = 'none';
                }
                this.loadClient(); /* Carrega o cliente. */
            }
        });

        /* Garante que os destaques visuais estejam atualizados. */
        this.applyInitialHighlights();
        this.saveGameState();
    }

    /**
     * Atualiza os botões de ação no painel de ação com base no estado atual do jogo.
     */
    updateActionButtonBasedOnState() {
        console.log("GameManager: Atualizando botão de ação.");
        if (this.state.showingTutorial) {
            console.log("Nenhum botão de ação padrão no tutorial.");
            return;
        }

        let buttonConfig = null;
        /* Se o jogo terminou, mostra o botão apropriado. */
        if (this.state.currentClientIndex === null || this.state.currentClientIndex < 0 || this.state.currentClientIndex >= CLIENTS.length) {
            console.warn("Fim de jogo ou índice de cliente inválido. Exibindo botão para Diário.");
            buttonConfig = { id: 'journal-btn', text: 'Abrir Diário', onClick: () => this.openJournal() };
        } else {
            const client = this.clientManager.getClientByIndex(this.state.currentClientIndex);

            /* Define o botão com base nas condições do jogo. */
            if (this.state.playerSigilChoice) {
                buttonConfig = { id: 'iniciar_game', text: 'Iniciar Jogo', onClick: () => this.startMinigame() };
            } else if (client && client.request) {
                buttonConfig = { id: 'analyze-request-btn', text: 'Analisar o Pedido', onClick: () => this.analyzeClientRequest() };
            } else {
                buttonConfig = { id: 'journal-btn', text: 'Abrir Diário', onClick: () => this.openJournal() };
            }
        }
        /* Delega a atualização do botão para o UIManager. */
        this.uiManager.updateActionButton(buttonConfig);

        /* Reaplicar quaisquer outros destaques visuais necessários. */
        this.applyInitialHighlights();
    }

    /* --- MÉTODOS AUXILIARES PARA ADICIONAR LISTENERS E NAVEGAÇÃO --- */

    /**
     * Adiciona o listener de clique para o item Mail.
     */
    addMailClickListener() {
        console.log("GameManager: Adicionando listener de clique ao item-mail.");
        const mailItemElement = this.dom.itemMail;
        if (mailItemElement) {
            if (this.handleMailClick) mailItemElement.removeEventListener('click', this.handleMailClick); /* Limpa listener anterior. */
            this.handleMailClick = () => {
                console.log("Clicado no item-mail. Navegando para mail.html.");
                // A navegação e o salvamento do estado (incluindo readMailIds) são feitos em mail.js.
                window.location.href = '/mail.html';
            };
            mailItemElement.addEventListener('click', this.handleMailClick);
        } else { console.warn("Elemento item-mail não encontrado."); }
    }

    /**
     * Adiciona o listener de clique para o item Diário.
     */
    addJournalClickListener() {
        console.log("GameManager: Adicionando listener de clique ao item-book (Diário).");
        const bookItemElement = this.dom.itemBook;
        if (bookItemElement) {
            if (this.handleJournalClick) bookItemElement.removeEventListener('click', this.handleJournalClick); /* Limpa listener anterior. */
            this.handleJournalClick = () => {
                console.log("Clicado no item-book. Navegando para journal.html.");
                // A navegação e o salvamento do estado (tutorialStep) são feitos em journal.js.
                window.location.href = '/journal.html';
            };
            bookItemElement.addEventListener('click', this.handleJournalClick);
        } else { console.warn("Elemento item-book não encontrado."); }
    }

    /**
     * Adiciona o listener de clique para o botão que inicia o minigame.
     */
    addMinigameButtonListener() {
        console.log("GameManager: Adicionando listener ao botão 'Iniciar Jogo'.");
        const button = document.getElementById('iniciar_game');
        if (button) {
            if (this.handleActionButtonClick) button.removeEventListener('click', this.handleActionButtonClick);
            this.handleActionButtonClick = () => this.startMinigame();
            button.addEventListener('click', this.handleActionButtonClick);
        } else { console.warn("Botão 'iniciar_game' não encontrado."); }
    }

    /**
     * Adiciona o listener de clique para o botão de análise do pedido do cliente.
     */
    addAnalysisButtonListener() {
        console.log("GameManager: Adicionando listener ao botão 'Analisar o Pedido'.");
        const button = document.getElementById('analyze-request-btn');
        if (button) {
            if (this.handleActionButtonClick) button.removeEventListener('click', this.handleActionButtonClick);
            this.handleActionButtonClick = () => this.analyzeClientRequest();
            button.addEventListener('click', this.handleActionButtonClick);
        } else { console.warn("Botão 'analyze-request-btn' não encontrado."); }
    }

    /* --- AÇÕES INICIADAS PELOS BOTÕES DE AÇÃO --- */

    /**
     * Inicia o minigame.
     */
    startMinigame() {
        console.log("Ação: Iniciar Jogo (minigame)");
        const sigilId = this.state.playerSigilChoice;
        if (sigilId && SIGILS[sigilId]) {
            this.saveGameState(); /* Salva o estado antes de sair. */
            const gameStateString = encodeURIComponent(JSON.stringify(this.state));
            window.location.href = `/minigame.html?sigil=${sigilId}&gameState=${gameStateString}`;
        } else {
            console.error("Sigilo inválido ou não selecionado para iniciar minigame.");
            alert("Por favor, selecione um sigilo no Diário antes de começar.");
        }
    }

    /**
     * Redireciona para a página de análise.
     */
    analyzeClientRequest() {
        console.log("Ação: Analisar o Pedido");
        const clientIndex = this.state.currentClientIndex;
        if (clientIndex !== null && clientIndex >= 0 && clientIndex < CLIENTS.length) {
            window.location.href = `/analysis.html?clientIndex=${clientIndex}`;
        } else {
            console.error("Índice de cliente inválido para análise.");
            alert("Erro ao iniciar a análise: Cliente não encontrado.");
        }
    }

    /* --- FUNÇÕES DE NAVEGAÇÃO PARA OUTRAS TELAS --- */

    openJournal() { console.log("Navegando para o Diário..."); window.location.href = '/journal.html'; }
    openMail() { console.log("Navegando para as Cartas..."); window.location.href = '/mail.html'; }
    showNightPhase() { console.log("Avançando para a Fase Noturna..."); window.location.href = '/night.html'; }
    endGame() { console.log("O JOGO TERMINOU."); alert("Fim do jogo!"); localStorage.removeItem('gameState'); window.location.href = '/index.html'; }

    /* --- FUNÇÕES DE ATUALIZAÇÃO DA UI (DELEGADAS AO UIManager) --- */

    /**
     * Atualiza o retrato do personagem na tela.
     * @param {object} client Os dados do cliente.
     */
    updateCharacterSprite(client) {
        this.uiManager.updateCharacterSprite(client);
    }

    /**
     * Atualiza o retrato do personagem para uma variação específica de diálogo.
     * @param {object} client Os dados do cliente.
     * @param {string} dialogueStepKey A chave do passo do diálogo.
     */
    updateDialogueSprite(client, dialogueStepKey) {
        this.uiManager.updateDialogueSprite(client, dialogueStepKey);
    }

    /**
     * Exibe um nó de diálogo na interface.
     * @param {object} nodeData Os dados do nó de diálogo.
     */
    displayDialogue(nodeData) {
        const client = this.clientManager.getClientByIndex(this.state.currentClientIndex);
        if (client) {
            this.uiManager.displayDialogue(nodeData, client);
        } else {
            console.error("GameManager: Cliente não encontrado para exibir diálogo.");
        }
    }

    /**
     * Finaliza o diálogo, reseta a UI e salva o estado.
     */
    handleDialogueEnd() {
        console.log("GameManager: Finalizando diálogo.");
        this.state.currentDialogueNode = null; /* Limpa o estado do diálogo. */
        this.uiManager.resetClientInterface(); /* Reseta a UI. */
        this.updateActionButtonBasedOnState(); /* Atualiza botões de ação. */
        this.saveGameState(); /* Salva o estado. */
    }

    /**
     * Atualiza as estatísticas visíveis na tela.
     */
    updateStats() {
        this.uiManager.updateStats(); /* Delega a atualização das estatísticas. */
    }

    /**
     * Aplica efeitos visuais com base no nível de Sanidade.
     */
    applySanityEffects() {
        this.uiManager.applySanityEffects(this.state.sanity); /* Delega a aplicação dos efeitos. */
    }

    /**
     * Cria e exibe um botão "Próximo Cliente" no painel de ação.
     */
    showNextClientButton() {
        this.uiManager.showNextClientButton(); /* Delega a criação do botão. */
    }

    /**
     * Altera o nível de sanidade do jogador e atualiza os efeitos visuais.
     * @param {number} amount A quantidade de sanidade a ser adicionada ou subtraída.
     */
    changeSanity(amount) {
        const oldSanity = this.state.sanity;
        this.state.sanity += amount;
        this.state.sanity = Math.max(0, Math.min(this.state.maxSanity, this.state.sanity));
        this.updateStats();

        const sanityLow = this.state.sanity <= this.state.lowSanityThreshold;
        const sanityWasLow = oldSanity <= this.state.lowSanityThreshold;

        if (sanityLow && !sanityWasLow) this.playMusic(this.audioElements.criticalMusic, 0.5);
        else if (!sanityLow && sanityWasLow) this.playMusic(this.audioElements.gameBgMusic, 0.3);
    }

    /* --- MÉTODOS DE ÁUDIO (DELEGADOS PARA UIManager ou AudioUtils se criados) --- */
    /* Por enquanto, mantemos a lógica de áudio aqui, mas se precisar de mais complexidade,
       considere um AudioManager dedicado. */
    playMusic(element, volume = 0.2, fadeInDuration = 1000) {
        if (!element) return;
        // Implementação simplificada de playMusic.
        if (this.state.activeMusic && this.state.activeMusic !== element) { this.stopMusic(this.state.activeMusic); }
        this.state.activeMusic = element;
        element.currentTime = 0;
        element.volume = 0;
        element.play().catch(e => console.error("Erro ao tocar música:", e));
        let fadeInInterval = setInterval(() => {
            if (element.volume < volume) {
                element.volume += 0.02;
                element.volume = Math.min(element.volume, volume);
            } else {
                element.volume = volume;
                clearInterval(fadeInInterval);
            }
        }, fadeInDuration / (volume / 0.02));
    }

    stopMusic(element, fadeOutDuration = 800) {
        if (!element) return;
        // Implementação simplificada de stopMusic.
        let fadeOutInterval = setInterval(() => {
            if (element.volume > 0.01) {
                element.volume -= 0.05;
                element.volume = Math.max(element.volume, 0);
            } else {
                element.pause();
                element.currentTime = 0;
                if (this.state.activeMusic === element) this.state.activeMusic = null;
                clearInterval(fadeOutInterval);
            }
        }, fadeOutDuration / (element.volume / 0.05));
    }

    playSound(element, volume = 0.5, duration = 0) {
        if (!element) return;
        // Implementação simplificada de playSound.
        element.currentTime = 0;
        const clampedVolume = Math.max(0, Math.min(1, volume));
        element.volume = clampedVolume;
        element.play().catch(e => {});
        if (duration > 0) {
            setTimeout(() => {
                if (element && !element.paused) {
                    element.pause();
                    element.currentTime = 0;
                }
            }, duration);
        }
    }

    stopAllSfx() {
        /* Implementação simplificada de stopAllSfx. */
        const sfxElements = [this.dom.successSfx, this.dom.errorSfx];
        sfxElements.forEach(sfx => {
            if (sfx && !sfx.paused) {
                sfx.pause();
                sfx.currentTime = 0;
            }
        });
    }
}

/* --- CRIAÇÃO DA INSTÂNCIA GLOBAL DO JOGO --- */
/* Cria a instância global do jogo apenas se ela ainda não existir. */
if (typeof Game.instance === 'undefined') {
    console.log("Criando nova instância global do jogo.");
    window.game = new Game(); /* Define a instância globalmente acessível. */
} else {
    console.warn("Instância global do jogo 'game' já existe. Não recriando.");
}
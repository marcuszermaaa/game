// js/main.js
// ESTE É O PONTO DE ENTRADA PRINCIPAL DA PÁGINA DO JOGO (game.html)
// Sua única responsabilidade é inicializar e conectar todos os sistemas (Managers)
// na ordem correta. Ele funciona como um "maestro".

// ==========================================================
// --- 1. IMPORTAÇÕES DE MÓDULOS ---
// ==========================================================
// Importamos todas as classes "Manager" de que o jogo precisa.
// Graças ao `type="module"` no game.html, podemos usar esta sintaxe limpa.
import { GameManager } from './gameCore.js';
import { UIManager } from './managers/uiManager.js';
import { ClientManager } from './managers/ClientManager.js';
import { DialogueManager } from './managers/DialogueManager.js';
import { MinigameManager } from './managers/MinigameManager.js';
// Se você criar o MailManager, ele seria importado aqui também.
// import { MailManager } from './managers/MailManager.js';

// ==========================================================
// --- 2. INICIALIZAÇÃO DO JOGO ---
// ==========================================================
// Adicionamos um listener que espera a página HTML inteira ser carregada
// antes de tentar executar qualquer código. Isso evita erros de "elemento não encontrado".
document.addEventListener('DOMContentLoaded', () => {
    console.log("▶️ DOM carregado. Iniciando a orquestração do jogo...");

    // --- Passo A: Coletar Referências do DOM ---
    // Pegamos todos os elementos HTML que serão manipulados e os guardamos em um
    // único objeto. Isso torna muito mais fácil e limpo passar as referências
    // para o UIManager, que é o único que precisa delas.
    const domRefs = {
        characterSprite: document.getElementById('character-sprite'),
        eventClientName: document.getElementById('event-client-name'),
        eventDialogue: document.getElementById('event-dialogue'),
        actionPanel: document.getElementById('action-panel'),
        dialogueInteractionPanel: document.getElementById('dialogue-interaction-panel'),
        dialogueText: document.getElementById('dialogue-text'),
        dialogueOptionsContainer: document.getElementById('dialogue-options-container'),
        dayStat: document.getElementById('day-stat'),
        clientStat: document.getElementById('client-stat'),
        moneyValue: document.getElementById('money-value'),
        sanityProgressBar: document.getElementById('sanity-progress-bar'),
        itemMail: document.getElementById('item-mail'),
        itemBook: document.getElementById('item-book'),
        itemWorkbench: document.getElementById('item-workbench')
    };

    // --- Passo B: Instanciar os Managers ---
    // Criamos as instâncias de cada classe na ordem de dependência.
    
    // 1. O GameManager é o cérebro. Ele carrega o gameState e não depende de mais ninguém no construtor.
    const game = new GameManager();

    // 2. Os outros managers são criados. Eles recebem as dependências de que precisam para funcionar.
    //    Por exemplo, o UIManager precisa das referências do DOM (domRefs), do estado do jogo (game.gameState)
    //    e da instância principal do jogo (game) para que os botões que ele cria possam chamar funções do GameManager.
    const clientManager = new ClientManager(game.gameState);
    const dialogueManager = new DialogueManager(game.gameState, game);
    const uiManager = new UIManager(domRefs, game.gameState, game);
    const minigameManager = new MinigameManager(game.gameState, game);
    // const mailManager = new MailManager(game.gameState, uiManager, game); // Seria adicionado aqui

    // --- Passo C: Injeção de Dependências ---
    // Agora que todos os managers foram criados, nós os "injetamos" no GameManager.
    // Isso significa que o GameManager agora tem acesso direto a eles (ex: `game.uiManager`).
    // É uma abordagem muito mais segura e organizada do que usar variáveis globais (window.UIManager).
    game.injectManagers({
        ui: uiManager,
        client: clientManager,
        dialogue: dialogueManager,
        minigame: minigameManager,
     
    });

    // --- Passo D: Iniciar o Jogo ---
    // Com tudo carregado e conectado, damos o comando para o GameManager iniciar a lógica do jogo.
    game.startGame();

    // --- Passo E (Opcional, mas útil): Expor para Depuração ---
    // Atribuímos a instância principal do jogo à janela (window). Isso não é necessário para o jogo
    // funcionar, mas nos permite abrir o console do navegador (F12), digitar "game" e
    // inspecionar todo o estado e os managers em tempo real. É uma ferramenta de depuração poderosa.
    window.game = game;
    console.log("✅ Jogo inicializado com sucesso. Instância principal disponível como 'window.game'.");
});
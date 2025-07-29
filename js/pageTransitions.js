// js/pageTransitions.js - Gerenciador Global de Transições, Efeitos Sonoros e Música

// ===================================================================
//  1. GERENCIADOR DE EFEITOS SONOROS (SoundManager)
// ===================================================================

/**
 * Um objeto singleton para gerenciar o pré-carregamento e a reprodução
 * de efeitos sonoros curtos (SFX).
 */
const SoundManager = {
    /**
     * Objeto que armazenará os elementos <audio> pré-carregados,
     * usando seus nomes como chaves.
     * @type {Object.<string, HTMLAudioElement>}
     */
    sounds: {},

    /**
     * Inicializa o SoundManager. Itera sobre uma lista de sons para pré-carregá-los.
     * @param {Object.<string, string>} soundList - Um objeto onde a chave é o nome de referência do som e o valor é o caminho do arquivo.
     */
    init(soundList) {
        console.log("SoundManager: Iniciando pré-carregamento de efeitos sonoros...");
        for (const name in soundList) {
            this.loadSound(name, soundList[name]);
        }
    },

    /**
     * Cria um elemento <audio> para um som específico e o armazena no objeto 'sounds'.
     * @param {string} name - O nome de referência para o som (ex: 'ui_click').
     * @param {string} src - O caminho para o arquivo de áudio.
     */
    loadSound(name, src) {
        const sound = new Audio(src);
        sound.preload = 'auto'; // Instrução para o navegador carregar o áudio o mais rápido possível.
        this.sounds[name] = sound;
    },

    /**
     * Toca um som pré-carregado.
     * @param {string} name - O nome do som a ser tocado, conforme definido na lista de inicialização.
     */
    play(name) {
        const sound = this.sounds[name];
        if (sound) {
            // Reinicia o tempo do áudio para 0. Isso permite que o som seja tocado
            // novamente em rápida sucessão (ex: cliques rápidos em botões).
            sound.currentTime = 0;
            // O método play() retorna uma Promise. Usamos .catch() para capturar e silenciar
            // possíveis erros caso o navegador bloqueie a reprodução por algum motivo.
            sound.play().catch(error => console.warn(`Não foi possível tocar o som "${name}":`, error));
        } else {
            console.warn(`SoundManager: Som com o nome "${name}" não foi encontrado ou carregado.`);
        }
    }
};

// ===================================================================
//  2. GERENCIADOR DE MÚSICA DE FUNDO (MusicManager)
// ===================================================================

/**
 * Um objeto singleton para gerenciar a reprodução contínua de música de fundo.
 */
const MusicManager = {
    /**
     * Armazena a referência para o elemento <audio> da faixa de música atual.
     * @type {HTMLAudioElement | null}
     */
    currentTrack: null,

    /**
     * Toca uma faixa de música em loop. Para e substitui a faixa anterior se uma diferente for solicitada.
     * @param {string} src - O caminho para o arquivo de música.
     */
    play(src) {
        // Se a música solicitada já é a que está tocando, não faz nada para evitar recarregamentos.
        if (this.currentTrack && this.currentTrack.src.endsWith(src)) {
            return;
        }

        // Se uma música diferente estiver tocando, pausa e remove a referência a ela.
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack = null;
        }

        // Cria, configura e toca a nova faixa de música.
        this.currentTrack = new Audio(src);
        this.currentTrack.loop = true;   // Garante que a música se repita indefinidamente.
        this.currentTrack.volume = 0.3; // Define um volume padrão mais baixo (0.0 a 1.0).
        
        // Tenta tocar a música. Isso provavelmente será bloqueado pelo navegador até a primeira interação.
        // O .catch() lida com o erro esperado de forma silenciosa no console.
        this.currentTrack.play().catch(error => {
            console.log("Música de fundo bloqueada pelo navegador. Aguardando interação do usuário.", error.name);
        });
    }
};


// ===================================================================
//  3. LÓGICA DE TRANSIÇÃO E INICIALIZAÇÃO GERAL
// ===================================================================

/**
 * Função principal que é executada quando o script é carregado.
 * Ela configura as transições de página e inicializa os gerenciadores de áudio.
 */
function initializePageEffects() {
    const body = document.body;
    const transitionType = body.dataset.transition;

    // --- LÓGICA DE FADE-IN DA PÁGINA ---
    if (transitionType) {
        // Adiciona a classe que define o estado inicial (invisível e/ou fora de posição).
        body.classList.add('transition-fade');
        
        // Usa requestAnimationFrame para garantir que o navegador tenha processado
        // o estado inicial antes de acionar a transição para o estado final.
        requestAnimationFrame(() => {
            // Uma segunda chamada aninhada aumenta a compatibilidade entre diferentes navegadores.
            requestAnimationFrame(() => {
                body.classList.add('page-visible');
            });
        });
    }

    // --- INICIALIZAÇÃO DO GERENCIADOR DE EFEITOS SONOROS ---
    const soundsToLoad = {
        'ui_click': '../media/sfx/click2.mp3',
        'sucesso': '../media/sfx/sucesso.mp3',
        'erro': '../media/sfx/erro.mp3',
        'page_turn': '../media/sfx/click.mp3',
        'paper_rustle': '../media/sfx/click.mp3',
            'item_get': '../media/sfx/item_get.mp3' // <-- ADICIONE ESTA LINHA

        // Adicione mais apelidos e caminhos de SFX aqui no futuro.
    };
    SoundManager.init(soundsToLoad);

    // Expõe o SoundManager globalmente para que outros scripts possam usá-lo se necessário.
    window.GameAudio = SoundManager;

    // --- LISTENER DE CLIQUE GENÉRICO PARA EFEITOS SONOROS ---
    document.addEventListener('click', (e) => {
        // Procura pelo ancestral mais próximo que seja um <button> OU que tenha o atributo [data-sound-click].
        const clickableElement = e.target.closest('button, [data-sound-click]');
        
        if (clickableElement) {
            // Verifica se o elemento tem um som específico definido em seu atributo.
            const specificSound = clickableElement.dataset.soundClick;
            
            if (specificSound) {
                // Se tiver, toca o som específico (ex: 'page_turn').
                window.GameAudio.play(specificSound);
            } else {
                // Se não tiver um som específico, mas for um elemento clicável, toca o som de clique padrão.
                window.GameAudio.play('ui_click');
            }
        }
    }, true); // O 'true' usa o modo de captura, garantindo que o som toque mesmo que outros scripts parem o evento.

    // --- LISTENER PARA A PRIMEIRA INTERAÇÃO DO USUÁRIO PARA INICIAR A MÚSICA ---
    /**
     * Esta função é acionada apenas uma vez, na primeira interação do usuário,
     * para contornar a política de autoplay do navegador e iniciar a música de fundo.
     */
    function handleFirstInteractionToPlayMusic() {
        const musicSrc = body.dataset.musicSrc;
        if (musicSrc) {
            console.log(`Primeira interação do usuário detectada. Tocando a música da página: ${musicSrc}`);
            MusicManager.play(musicSrc);
        }
    }

    // Vincula a função de inicialização de música a múltiplos tipos de interação.
    // A opção `{ once: true }` garante que cada listener seja executado apenas uma vez e depois se auto-remova.
    // O primeiro destes eventos a ocorrer (seja um clique, uma tecla ou um movimento do mouse) acionará a música.
    document.addEventListener('click', handleFirstInteractionToPlayMusic, { once: true });
    document.addEventListener('keydown', handleFirstInteractionToPlayMusic, { once: true });
    document.addEventListener('mousemove', handleFirstInteractionToPlayMusic, { once: true });
}

// Inicia todo o processo.
initializePageEffects();
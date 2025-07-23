// js/constants.js - Constantes globais e utilidades de configuração.

// --- UTILIDADES GLOBAIS ---

/**
 * Verifica se o dispositivo atual suporta toque.
 * Usado para adaptar a interface e controles do jogo.
 * @type {boolean}
 */
export const IS_TOUCH_DEVICE = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

/**
 * Largura de UM frame do seu sprite de personagem.
 * Necessário para calcular qual parte do sprite de personagem mostrar.
 * @type {number}
 */
export const CHARACTER_FRAME_WIDTH = 150;

/**
 * Largura de cada frame no sprite de cartas (itens da barra de menu).
 * Usado para calcular o posicionamento de ícones como Mail, Book, Workbench.
 * @type {number}
 */
export const CARD_SPRITE_FRAME_WIDTH = 200;

/**
 * Caminho para a imagem de fundo genérica usada durante transições (fim de dia/início de novo dia).
 * @type {string}
 */
export const CLIENT_TRANSITION_BACKGROUND = "/media/img/background_cliente_sombra.png"; // Defina o caminho correto para a sua imagem de sombra/transição

/**
 * Limiar de Sanidade para aplicar efeitos visuais e musicais de baixo nível.
 * @type {number}
 */
export const LOW_SANITY_THRESHOLD = 10;

/**
 * Sanidade máxima que o jogador pode ter.
 * @type {number}
 */
export const MAX_SANITY = 100;

/**
 * Número de clientes atendidos por dia.
 * @type {number}
 */
export const CLIENTS_PER_DAY = 3;

// --- OUTRAS CONSTANTES GLOBAIS GENÉRICAS PODEM SER ADICIONADAS AQUI ---
// Exemplo: const GAME_TITLE = "The Ink & Sigil";

export const STARTING_INK_PER_DAY = 1;
export const MAX_INK = 3;
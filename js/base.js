// js/base.js - Utilitários globais.

// --- PERGUNTA SOBRE COMUNICAÇÃO GLOBAL ---
// "posso enviar e receber para todos os outros por aqui ?"
// Resposta: Não é ideal usar `base.js` como um hub central para comunicação entre
// todos os outros scripts. Cada script deve importar o que precisa diretamente.
// Para comunicação entre componentes, é melhor usar:
// 1. Importações diretas (ex: mail.js importando MAILS).
// 2. Passar instâncias de Managers ou do GameManager conforme a necessidade (como UIManager recebe GameManager).
// 3. Para padrões mais complexos, um Event Bus (Pub/Sub) pode ser considerado.
// Utilitários aqui devem ser funções puras ou que manipulam o DOM globalmente de forma genérica.

/**
 * Verifica se um elemento está visível na viewport.
 * Útil para lazy loading ou outras otimizações.
 * @param {HTMLElement} el O elemento a ser verificado.
 * @returns {boolean} True se o elemento estiver visível, false caso contrário.
 */
export function isElementInViewport(el) {
    if (!el) return false; // Retorna false se o elemento não for válido.
    const rect = el.getBoundingClientRect(); // Obtém as dimensões e posição do elemento.
    // Verifica se o topo e a esquerda do elemento estão dentro dos limites da viewport,
    // e se o fundo e a direita do elemento também estão dentro dos limites.
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Converte um número para formato de dinheiro.
 * @param {number} amount O valor numérico.
 * @returns {string} O valor formatado como moeda.
 */
export function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

// --- EXPORTAÇÕES ADICIONAIS DE UTILITÁRIOS GLOBAIS (SE HOUVER) ---
// Exemplo:
// export function loadAsset(url) { ... }
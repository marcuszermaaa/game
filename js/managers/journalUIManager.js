// js/managers/journalUIManager.js - RESPONSABILIDADE: APENAS VISUAL (COMPLETO E ATUALIZADO)

// =================================================================== //
//                    FUNÇÃO AUXILIAR EXPORTADA                          //
// =================================================================== //
// Esta função é uma utilidade visual pura. Exportá-la diretamente permite
// que qualquer outro módulo a utilize sem precisar de uma instância do UIManager.
export function generateSigilDrawing(nodes) {
    if (!nodes) return '<p class="error-text">Dados do sigilo ausentes.</p>';
    
    let html = '';
    // Desenha as linhas que conectam os nós
    for (let i = 0; i < nodes.length - 1; i++) {
        const node = nodes[i];
        const nextNode = nodes[i + 1];
        const dx = (nextNode.x - node.x) * 100;
        const dy = (nextNode.y - node.y) * 100;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        html += `<div class="line" style="position: absolute; left: ${node.x * 100}%; top: ${node.y * 100}%; width: ${length}%; height: 2px; background-color: #eee; transform-origin: 0 0; transform: rotate(${angle}deg);"></div>`;
    }
    // Desenha os nós (círculos)
    nodes.forEach((node) => {
        html += `<div class="circle" style="position: absolute; left: ${node.x * 100}%; top: ${node.y * 100}%; width: 5px; height: 5px; background-color: #eee; border-radius: 50%; transform: translate(-50%, -50%);"></div>`;
    });
    return html;
}

// A classe agora fica mais limpa, focada apenas em métodos que manipulam o DOM do grimório.
export class JournalUIManager {
    constructor(domRefs) {
        this.dom = domRefs;
    }

    /**
     * Aplica destaques visuais com base no passo atual do tutorial.
     * Esta função é chamada pelo JournalManager quando a página do grimório carrega.
     * @param {string} tutorialStep - O identificador do passo atual do tutorial (ex: 'highlight_simbolos_tab').
     */
    applyTutorialHighlights(tutorialStep) {
        // Primeiro, garante que nenhum outro botão esteja piscando.
        this.dom.grimorioTabs.querySelectorAll('.highlight-pulse').forEach(el => el.classList.remove('highlight-pulse'));

        // <<< NOVA LÓGICA DO TUTORIAL AQUI >>>
        // Verifica se o passo atual do tutorial é aquele que definimos no gameCore.js
        if (tutorialStep === 'highlight_simbolos_tab') {
            // Encontra o botão da aba "Símbolos" usando seu data-attribute.
            const simbolosTab = this.dom.grimorioTabs.querySelector('[data-tab="simbolos"]');
            
            // Se o botão for encontrado, adiciona a classe CSS que cria o efeito de pulsar.
            if (simbolosTab) {
                console.log("TUTORIAL (Journal): Aplicando highlight na aba de Símbolos.");
                simbolosTab.classList.add('highlight-pulse');
            }
        }
        // <<< FIM DA NOVA LÓGICA >>>
    }

    /**
     * Atualiza os displays de status na lateral do grimório (como a Sanidade).
     * @param {object} gameState - O estado atual do jogo.
     */
    updateStatusDisplays(gameState) {
        if (this.dom.journalSanityValue) {
            this.dom.journalSanityValue.textContent = gameState.sanity ?? '??';
        }
        // Outros status poderiam ser atualizados aqui no futuro.
    }
    
    /**
     * Controla a visibilidade dos botões de paginação (Anterior/Próxima).
     * @param {number} currentPage - O índice da página atual (começando em 0).
     * @param {number} totalPages - O número total de páginas.
     */
    updateNavigationButtons(currentPage, totalPages) {
        if (totalPages > 1) {
            this.dom.prevContentBtn.style.display = (currentPage > 0) ? 'block' : 'none';
            this.dom.nextContentBtn.style.display = (currentPage < totalPages - 1) ? 'block' : 'none';
        } else {
            this.dom.prevContentBtn.style.display = 'none';
            this.dom.nextContentBtn.style.display = 'none';
        }
    }

    /**
     * Mostra o botão "Selecionar Sigilo" e armazena o ID do sigilo clicado.
     * @param {string} sigilId - O ID do sigilo que foi selecionado.
     */
    showSelectSigilButton(sigilId) {
        if (this.dom.selectSigilBtn) {
            this.dom.selectSigilBtn.style.display = 'block';
            this.dom.selectSigilBtn.dataset.selectedSigil = sigilId;
        }
    }

    /**
     * Esconde o botão "Selecionar Sigilo".
     */
    hideSelectSigilButton() {
        if (this.dom.selectSigilBtn) {
            this.dom.selectSigilBtn.style.display = 'none';
            delete this.dom.selectSigilBtn.dataset.selectedSigil;
        }
    }
    
    /**
     * Limpa a área de conteúdo principal para renderizar uma nova aba.
     */
    clearContentArea() {
        if (this.dom.dynamicContentArea) {
            this.dom.dynamicContentArea.innerHTML = '';
        }
    }
}
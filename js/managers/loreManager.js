// js/lore.js - Lógica para a visualização de páginas de lore.

// --- IMPORTS ---
import { LORE_PAGES } from '../data/loreData.js'; // Importa os dados das páginas de lore.

// Verifica se LORE_PAGES foi importado corretamente.
if (typeof LORE_PAGES === 'undefined') {
    console.error("ERRO CRÍTICO: LORE_PAGES não está definido! Certifique-se de que loreData.js está no caminho correto e sendo carregado.");
}

document.addEventListener('DOMContentLoaded', () => {
    const loreListElement = document.getElementById('lore-list');
    const modalOverlay = document.getElementById('messageModalOverlay');
    const closeModalButton = document.getElementById('closeModalButton');
    const modalContentArea = document.getElementById('modalContentArea');
    const rightPanel = document.querySelector('.right-panel');

    // --- Funções do Modal ---
    function openMessageModal(title, content) {
        modalContentArea.innerHTML = `<h2>${title}</h2>${content}`;
        modalOverlay.style.display = 'flex';
        modalContentArea.scrollTop = 0; // Reinicia a rolagem do modal
    }

    function closeMessageModal() {
        modalOverlay.style.display = 'none';
    }

    // --- Popula a lista de Lore ---
    function populateLoreList() {
        if (!loreListElement) {
            console.error("Elemento 'lore-list' não encontrado no DOM!");
            return;
        }

        loreListElement.innerHTML = ''; // Limpa os itens existentes
        LORE_PAGES.forEach((pageContent, index) => {
            if (index === 0) return; // Pula o índice 0 conforme o comentário em loreData.js (se aplicável ao seu loreData.js)

            // Extrai o título do conteúdo da lore (assumindo que começa com <h3>)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = pageContent;
            const titleElement = tempDiv.querySelector('h3');
            const title = titleElement ? titleElement.textContent : `Tomo Desconhecido ${index}`;

            const listItem = document.createElement('li');
            listItem.classList.add('lore-item');
            listItem.dataset.loreId = index; // Usa o índice como ID

            listItem.innerHTML = `
                <img src="https://via.placeholder.com/25/3e2723/f0ead6?text=👁" alt="Icone Olho" class="item-icon-ink">
                <a>${title}</a>
            `;

            listItem.addEventListener('click', () => {
                // Remove 'active' de todos os itens em ambas as listas
                document.querySelectorAll('.panel-list li').forEach(li => li.classList.remove('active'));
                listItem.classList.add('active');
                openMessageModal(title, pageContent);
            });
            loreListElement.appendChild(listItem);
        });
    }

    // Atribui evento de clique para fechar o modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeMessageModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            // Fecha o modal se clicar fora do conteúdo
            if (e.target === modalOverlay) {
                closeMessageModal();
            }
        });
    }

    // Opcional: Adicionar funcionalidade de scroll com a roda do mouse diretamente no right-panel
    if (rightPanel) {
        rightPanel.addEventListener('wheel', (e) => {
            e.preventDefault(); // Impede o scroll da página principal
            rightPanel.scrollTop += e.deltaY;
        });
    }


    // População inicial da lista de lore
    populateLoreList();
});
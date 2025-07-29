// js/workbench.js - Gerencia toda a lógica da página da bancada de trabalho, incluindo a criação de recargas.

// Importa os dados necessários. Usa o nome correto e mais genérico 'ITENS_CRIADOS'.
import { ELEMENTOS, ITENS_CRIADOS, RECEITAS } from './data/workbenchData.js';

/**
 * Classe que gerencia a interface e a lógica da bancada de trabalho.
 */
class WorkbenchManager {
    constructor() {
        // Mapeia todos os elementos da interface que o script precisa controlar para fácil acesso.
        this.dom = {
            craftingTable: document.getElementById('craftingTable'),
            elementosDisponiveisDiv: document.getElementById('elementosDisponiveis'),
            craftButton: document.getElementById('craftButton'),
            resultDisplay: document.getElementById('resultDisplay'),
            backButton: document.getElementById('back-to-game-btn')
        };

        // Estado interno do manager
        this.elementosNaMesa = []; // Guarda os IDs dos ingredientes atualmente selecionados para a criação.
        this.playerIngredients = {}; // Guarda os ingredientes que o jogador possui, com suas quantidades.
    }

    /**
     * Ponto de entrada. Carrega o estado, renderiza a UI e vincula os eventos.
     */
    init() {
        console.log("WorkbenchManager: ✅ DOM carregado. Iniciando manager...");
        this.loadGameState();
        this.bindEvents();
        this.renderAvailableItems();
        this.renderCraftingTable();
    }

    /**
     * Carrega o estado do jogo do localStorage, focando nos ingredientes de criação que o jogador possui.
     */
    loadGameState() {
        const gameState = JSON.parse(localStorage.getItem('gameState')) || {};
        // Carrega o objeto de ingredientes com suas quantidades.
        this.playerIngredients = gameState.craftingIngredients || {};
        console.log("WorkbenchManager: Inventário de ingredientes carregado:", this.playerIngredients);
    }

    /**
     * Vincula os eventos de clique aos botões e elementos interativos da interface.
     */
    bindEvents() {
        // Vincula o clique nos itens da lista de disponíveis para adicioná-los à mesa.
        if (this.dom.elementosDisponiveisDiv) {
            this.dom.elementosDisponiveisDiv.addEventListener('click', (e) => {
                const itemDiv = e.target.closest('.item');
                if (itemDiv) {
                    this.handleAddItemClick(itemDiv.dataset.itemName);
                }
            });
        }

        // Vincula o clique nos itens DA MESA para removê-los.
        if (this.dom.craftingTable) {
            this.dom.craftingTable.addEventListener('click', (e) => {
                const itemDiv = e.target.closest('.item');
                if (itemDiv) {
                    this.handleRemoveItemClick(itemDiv.dataset.itemName);
                }
            });
        }

        // Vincula o botão de criar.
        if (this.dom.craftButton) {
            this.dom.craftButton.addEventListener('click', () => this.handleCraftClick());
        } else { console.error("Botão 'craftButton' não encontrado no HTML!"); }

        // Vincula o botão de voltar.
        if (this.dom.backButton) {
            this.dom.backButton.addEventListener('click', () => { window.location.href = '/game.html'; });
        } else { console.error("Botão 'back-to-game-btn' não encontrado no HTML!"); }
    }

    /**
     * Renderiza a lista de ingredientes que o jogador possui e pode usar na criação.
     */
    renderAvailableItems() {
        this.dom.elementosDisponiveisDiv.innerHTML = '';
        const hasItems = Object.keys(this.playerIngredients).some(key => this.playerIngredients[key] > 0);

        if (!hasItems) {
            this.dom.elementosDisponiveisDiv.innerHTML = '<p class="placeholder-text">Nenhum ingrediente arcano.</p>';
            return;
        }

        for (const key in this.playerIngredients) {
            const quantity = this.playerIngredients[key];
            if (quantity > 0) { // Só mostra o item se a quantidade for maior que zero.
                const itemData = ELEMENTOS[key];
                if (itemData) {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item');
                    itemDiv.dataset.itemName = key;
                    itemDiv.innerHTML = `<span class="item-icon">⚛️</span>${this._formatName(key)} <span class="item-quantity">(x${quantity})</span><span class="tooltip">${itemData.descricao}</span>`;
                    this.dom.elementosDisponiveisDiv.appendChild(itemDiv);
                }
            }
        }
        this._updateAvailableItemVisuals();
    }

    handleAddItemClick(itemName) {
        if (!itemName) return;
        const playerQuantity = this.playerIngredients[itemName] || 0;
        const onTableQuantity = this.elementosNaMesa.filter(item => item === itemName).length;
        if (playerQuantity > onTableQuantity && this.elementosNaMesa.length < 3) {
            this.elementosNaMesa.push(itemName);
            this.renderCraftingTable();
            this._updateAvailableItemVisuals();
        }
    }

    handleRemoveItemClick(itemName) {
        if (!itemName) return;
        const index = this.elementosNaMesa.indexOf(itemName);
        if (index > -1) {
            this.elementosNaMesa.splice(index, 1);
            this.renderCraftingTable();
            this._updateAvailableItemVisuals();
        }
    }
    
    _updateAvailableItemVisuals() {
        this.dom.elementosDisponiveisDiv.querySelectorAll('.item').forEach(el => {
            const itemName = el.dataset.itemName;
            const playerQuantity = this.playerIngredients[itemName] || 0;
            const onTableQuantity = this.elementosNaMesa.filter(item => item === itemName).length;
            el.classList.toggle('disabled', onTableQuantity >= playerQuantity);
        });
    }

    renderCraftingTable() {
        this.dom.craftingTable.innerHTML = '';
        if (this.elementosNaMesa.length === 0) { this.dom.craftingTable.innerHTML = '<p class="placeholder-text">Selecione os ingredientes para combinar.</p>'; return; }
        this.elementosNaMesa.forEach(itemName => {
            const itemData = ELEMENTOS[itemName];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.dataset.itemName = itemName;
            itemDiv.innerHTML = `<span class="item-icon">⚛️</span>${this._formatName(itemName)}`;
            itemDiv.title = `Clique para remover: ${itemData.descricao}`;
            this.dom.craftingTable.appendChild(itemDiv);
        });
    }

    handleCraftClick() {
        if (this.elementosNaMesa.length === 0) { this.displayResult({ tipo: "Mesa Vazia", descricao: "Adicione ingredientes.", status: "neutro" }); return; }
        const elementosOrdenados = [...this.elementosNaMesa].sort();
        let receitaEncontrada = null;
        for (const receita of RECEITAS) {
            const receitaCombinacaoOrdenada = [...receita.combinacao].sort();
            if (JSON.stringify(elementosOrdenados) === JSON.stringify(receitaCombinacaoOrdenada)) {
                receitaEncontrada = receita; break;
            }
        }
        if (receitaEncontrada) {
            const itemCriadoId = receitaEncontrada.resultado;
            const dadosDoItem = ITENS_CRIADOS[itemCriadoId];
            this.updateGameStateOnCraft(itemCriadoId, this.elementosNaMesa);
            this.displayResult({ tipo: "Sucesso!", descricao: `Você criou: ${dadosDoItem.name}.`, status: "bom" });
            this.loadGameState();
            this.renderAvailableItems();
        } else {
            this.displayResult({ tipo: "Falha", descricao: "A combinação não produziu nada.", status: "ruim" });
        }
        this.resetCraftingTable();
    }

    updateGameStateOnCraft(itemCriadoId, ingredientesUsados) {
        let gameState = JSON.parse(localStorage.getItem('gameState')) || {};

        // Verifica se o item criado é uma recarga de borrifador
        if (itemCriadoId === 'recarga_borrifador') {
            if (!gameState.recargasBorrifador) gameState.recargasBorrifador = 0;
            gameState.recargasBorrifador++;
        } else {
            // Se for uma tinta normal ou outro item, adiciona ao inventário correspondente
            if (!gameState.craftedInks) gameState.craftedInks = {};
            gameState.craftedInks[itemCriadoId] = (gameState.craftedInks[itemCriadoId] || 0) + 1;
        }

        // Consome os ingredientes usados, decrementando suas quantidades
        if (!gameState.craftingIngredients) gameState.craftingIngredients = {};
        ingredientesUsados.forEach(ingrediente => {
            if (gameState.craftingIngredients[ingrediente]) {
                gameState.craftingIngredients[ingrediente]--;
            }
        });
        
        localStorage.setItem('gameState', JSON.stringify(gameState));
    }
    
    displayResult(resultado) { this.dom.resultDisplay.innerHTML = `<p><strong>Resultado:</strong> ${resultado.tipo}</p><p><strong>Descrição:</strong> ${resultado.descricao}</p><p><strong>Status:</strong> <span class="result-status status-${resultado.status}">${resultado.status.toUpperCase()}</span></p>`; }
    resetCraftingTable() { this.elementosNaMesa = []; this.renderCraftingTable(); this._updateAvailableItemVisuals(); }
    _formatName(name) { return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); }
}

// Inicia o manager somente após o HTML estar completamente carregado.
document.addEventListener('DOMContentLoaded', () => {
    const workbench = new WorkbenchManager();
    workbench.init();
});
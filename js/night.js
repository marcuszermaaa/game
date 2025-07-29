// /js/night.js - VERSÃO COM LAYOUT MELHORADO

import { UPGRADES } from './data/upgradeData.js';
import { MAX_INK, STARTING_INK_PER_DAY } from './constants.js';

let feedbackTimeout;

/** Exibe uma mensagem de feedback na tela. */
function showPurchaseFeedback(message) {
    const feedbackEl = document.getElementById('purchase-feedback');
    if (!feedbackEl) return;
    clearTimeout(feedbackTimeout);
    feedbackEl.textContent = message;
    feedbackEl.classList.add('visible');
    feedbackTimeout = setTimeout(() => {
        feedbackEl.classList.remove('visible');
    }, 3500);
}

/** ✨ ATUALIZA AS ESTATÍSTICAS DO JOGADOR NA TELA ✨ */
function updatePlayerStats(gameState) {
    const moneyDisplay = document.getElementById('player-money-display');
    if (moneyDisplay) {
        moneyDisplay.textContent = `Dinheiro: $${gameState.money}`;
    }
}

/** Renderiza a loja, agora separada por categorias. */
function renderShop(gameState) {
    const permanentGrid = document.querySelector('#permanent-upgrades .card-grid');
    const consumableGrid = document.querySelector('#consumable-items .card-grid');
    
    if (!permanentGrid || !consumableGrid) return;
    
    permanentGrid.innerHTML = '';
    consumableGrid.innerHTML = '';
    
    const purchasedUpgrades = new Set(gameState.purchasedUpgrades || []);

    for (const key in UPGRADES) {
        const upgrade = UPGRADES[key];
        const canAfford = gameState.money >= upgrade.cost;
        let isButtonDisabled = !canAfford;
        let buttonText = "Comprar";

        // Cria o card do item
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.classList.add(`card-type-${upgrade.type}`); // Adiciona classe para ícone

        // Lógica de estado do botão
        switch (upgrade.type) {
            case 'consumable':
                if (key === 'refill_ink' && gameState.inkCharges >= MAX_INK) {
                    isButtonDisabled = true;
                    buttonText = 'Tinteiro Cheio';
                }
                break;
            case 'permanent':
                if (purchasedUpgrades.has(key)) {
                    isButtonDisabled = true;
                    buttonText = 'Adquirido';
                }
                break;
        }

        card.innerHTML = `
            <h4>${upgrade.name}</h4>
            <p>${upgrade.description}</p>
            <div class="card-footer">
                <span class="card-price">$${upgrade.cost}</span>
                <button class="upgrade-btn" data-upgrade-id="${key}" ${isButtonDisabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;

        // Adiciona o card à categoria correta
        if (upgrade.type === 'permanent') {
            permanentGrid.appendChild(card);
        } else {
            consumableGrid.appendChild(card);
        }
    }
    
    // Vincula os eventos de clique aos botões de compra.
    document.querySelectorAll('.upgrade-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const upgradeId = e.target.dataset.upgradeId;
            buyItem(upgradeId);
        });
    });
}

/** Lógica para comprar um item. */
function buyItem(upgradeId) {
    let gameState = JSON.parse(localStorage.getItem('gameState'));
    const upgrade = UPGRADES[upgradeId];
    
    if (gameState.money >= upgrade.cost) {
        gameState.money -= upgrade.cost;

        switch (upgrade.type) {
            case 'ingredient':
                if (!gameState.craftingIngredients) gameState.craftingIngredients = {};
                gameState.craftingIngredients[upgrade.id] = (gameState.craftingIngredients[upgrade.id] || 0) + 1;
                showPurchaseFeedback(`"${upgrade.name}" adicionado ao inventário.`);
                break;
            case 'permanent':
                const purchasedSet = new Set(gameState.purchasedUpgrades || []);
                purchasedSet.add(upgradeId);
                gameState.purchasedUpgrades = Array.from(purchasedSet);
                showPurchaseFeedback(`"${upgrade.name}" adquirido permanentemente!`);
                break;
            case 'consumable':
                if (upgrade.effect) {
                    upgrade.effect(gameState);
                    showPurchaseFeedback(`Você usou "${upgrade.name}".`);
                }
                break;
        }
        
        localStorage.setItem('gameState', JSON.stringify(gameState));
        // Re-renderiza a loja e as estatísticas para refletir a mudança
        renderShop(gameState);
        updatePlayerStats(gameState);
    }
}

// --- PONTO DE ENTRADA PRINCIPAL DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    let gameState = JSON.parse(localStorage.getItem('gameState'));
    if (!gameState) {
        window.location.href = '/index.html';
        return;
    }
    
    const nightTitle = document.getElementById('night-title');
    if (nightTitle) nightTitle.textContent = `Fim do Dia ${gameState.day}`;
    
    // Renderização inicial
    updatePlayerStats(gameState);
    renderShop(gameState);
    
    const startNewDayBtn = document.getElementById('start-new-day-btn');
    if (startNewDayBtn) {
        startNewDayBtn.addEventListener('click', () => {
            let finalGameState = JSON.parse(localStorage.getItem('gameState'));
            
            finalGameState.day += 1; 
            finalGameState.clientInDay = 1;
            finalGameState.isNewDay = true; 
            finalGameState.inkCharges = Math.min(MAX_INK, (finalGameState.inkCharges || 0) + STARTING_INK_PER_DAY);
            finalGameState.purchasedUpgrades = Array.from(new Set(finalGameState.purchasedUpgrades || []));
            
            localStorage.setItem('gameState', JSON.stringify(finalGameState));
            window.location.href = '/game.html';
        });
    }
});
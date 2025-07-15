// js/night.js - Lógica para a página autônoma da fase noturna.

// --- IMPORTS ---
import { LORE_PAGES } from '../js/data/loreData.js';
import { UPGRADES } from '../js/data/upgradeData.js';

document.addEventListener('DOMContentLoaded', () => {
    let gameState = JSON.parse(localStorage.getItem('gameState'));

    if (!gameState) {
        console.error("Estado do jogo não encontrado!");
        window.location.href = '/game.html';
        return;
    }

    // --- RENDERIZAÇÃO DA PÁGINA ---
    const nightViewTitle = document.querySelector('#night-view-container h2');
    if (nightViewTitle) {
        nightViewTitle.textContent = `Fim do Dia ${gameState.day}`;
    }

    const loreRevealElement = document.getElementById('lore-reveal');
    if (loreRevealElement) {
        loreRevealElement.innerHTML = LORE_PAGES[gameState.day] || "<h3>Noite Silenciosa</h3><p>Você limpa o estúdio e se prepara para o amanhã...</p>";
    }

    const upgradesShopElement = document.getElementById('upgrades-shop');
    if (upgradesShopElement) {
        renderShop(gameState, upgradesShopElement);
    }

    // --- LÓGICA DE EVENTOS ---
    const startNewDayBtn = document.getElementById('start-new-day-btn');
    if (startNewDayBtn) {
        startNewDayBtn.addEventListener('click', () => {
            // --- CORREÇÃO CRÍTICA APLICADA AQUI ---
            // Prepara o estado para o novo dia.
            
            // 1. Incrementa o dia.
            gameState.day += 1; 
            
            // 2. RESETA o contador de clientes para o novo dia.
            gameState.clientInDay = 0; 
            
            // 3. Salva o estado FINALMENTE atualizado.
            localStorage.setItem('gameState', JSON.stringify(gameState));
            
            // 4. Volta para a tela principal para começar o novo dia.
            window.location.href = '/game.html';
        });
    }
});

/**
 * Função auxiliar para renderizar a loja e adicionar os listeners de compra.
 * (Esta função permanece a mesma, pois sua lógica está correta).
 */
function renderShop(gameState, shopElement) {
    let shopHtml = '';
    const purchasedUpgrades = Array.from(gameState.purchasedUpgrades || []);

    for (const key in UPGRADES) {
        const upgrade = UPGRADES[key];
        const isPurchased = purchasedUpgrades.includes(key);
        const canAfford = gameState.money >= upgrade.cost;
        const buttonDisabled = isPurchased || !canAfford ? 'disabled' : '';
        const buttonText = isPurchased ? 'Comprado' : `Comprar ($${upgrade.cost})`;
        
        shopHtml += `
            <div class="upgrade-card">
                <h4>${upgrade.name}</h4><p>${upgrade.description}</p>
                <button class="upgrade-btn" data-upgrade-id="${key}" ${buttonDisabled}>${buttonText}</button>
            </div>`;
    }
    shopElement.innerHTML = shopHtml;

    shopElement.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const upgradeId = btn.dataset.upgradeId;
            const upgrade = UPGRADES[upgradeId];
            
            let currentState = JSON.parse(localStorage.getItem('gameState'));
            const currentPurchased = Array.from(currentState.purchasedUpgrades || []);

            if (currentState.money >= upgrade.cost && !currentPurchased.includes(upgradeId)) {
                currentState.money -= upgrade.cost;
                currentPurchased.push(upgradeId);
                currentState.purchasedUpgrades = currentPurchased;

                if (upgrade.effect) {
                    const mockGameInstance = {
                        changeSanity: (amount) => { currentState.sanity = Math.max(0, Math.min(100, currentState.sanity + amount)); },
                        state: currentState
                    };
                    upgrade.effect(mockGameInstance);
                }
                
                localStorage.setItem('gameState', JSON.stringify(currentState));
                renderShop(currentState, shopElement);
            }
        });
    });
}
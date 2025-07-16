// js/night.js

import { LORE_PAGES } from '../js/data/loreData.js';
import { UPGRADES } from '../js/data/upgradeData.js';

// --- NOVA FUNÇÃO HELPER ---
let feedbackTimeout; // Guarda a referência do timeout para evitar sobreposições
/**
 * Mostra uma mensagem de feedback na tela por alguns segundos.
 * @param {string} message - A mensagem a ser exibida.
 */
function showPurchaseFeedback(message) {
    const feedbackEl = document.getElementById('purchase-feedback');
    if (!feedbackEl) return;

    clearTimeout(feedbackTimeout); // Limpa qualquer timeout anterior

    feedbackEl.textContent = message;
    feedbackEl.style.opacity = '1';

    feedbackTimeout = setTimeout(() => {
        feedbackEl.style.opacity = '0';
    }, 3500); // A mensagem desaparecerá após 3.5 segundos
}


document.addEventListener('DOMContentLoaded', () => {
    // ... (o início do seu DOMContentLoaded permanece o mesmo)
    let gameState = JSON.parse(localStorage.getItem('gameState'));
    if (!gameState) {
        console.error("Estado do jogo não encontrado!");
        window.location.href = '/game.html';
        return;
    }
    const nightViewTitle = document.querySelector('#night-view-container h2');
    if (nightViewTitle) nightViewTitle.textContent = `Fim do Dia ${gameState.day}`;
    const loreRevealElement = document.getElementById('lore-reveal');
    if (loreRevealElement) loreRevealElement.innerHTML = LORE_PAGES[gameState.day] || "<h3>Noite Silenciosa</h3><p>Você limpa o estúdio e se prepara para o amanhã...</p>";
    const upgradesShopElement = document.getElementById('upgrades-shop');
    if (upgradesShopElement) renderShop(gameState, upgradesShopElement);
    const startNewDayBtn = document.getElementById('start-new-day-btn');
    if (startNewDayBtn) {
        startNewDayBtn.addEventListener('click', () => {
            let finalGameState = JSON.parse(localStorage.getItem('gameState'));
            finalGameState.day += 1; 
            finalGameState.clientInDay = 0; 
            finalGameState.isNewDay = true;
            finalGameState.purchasedUpgrades = Array.from(finalGameState.purchasedUpgrades || []);
            localStorage.setItem('gameState', JSON.stringify(finalGameState));
            window.location.href = '/game.html';
        });
    }
});


function renderShop(currentGameState, shopElement) {
    // ... (a renderização da loja permanece a mesma)
    let shopHtml = '';
    const purchasedUpgrades = Array.from(currentGameState.purchasedUpgrades || []);
    for (const key in UPGRADES) {
        const upgrade = UPGRADES[key];
        const isPurchased = purchasedUpgrades.includes(key);
        const canAfford = currentGameState.money >= upgrade.cost;
        const buttonDisabled = isPurchased || !canAfford ? 'disabled' : '';
        const buttonText = isPurchased ? 'Comprado' : `Comprar ($${upgrade.cost})`;
        shopHtml += `<div class="upgrade-card"><h4>${upgrade.name}</h4><p>${upgrade.description}</p><button class="upgrade-btn" data-upgrade-id="${key}" ${buttonDisabled}>${buttonText}</button></div>`;
    }
    shopElement.innerHTML = shopHtml;

    shopElement.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const upgradeId = btn.dataset.upgradeId;
            const upgrade = UPGRADES[upgradeId];
            
            let latestGameState = JSON.parse(localStorage.getItem('gameState'));
            const currentPurchased = new Set(latestGameState.purchasedUpgrades || []);

            if (latestGameState.money >= upgrade.cost && !currentPurchased.has(upgradeId)) {
                latestGameState.money -= upgrade.cost;
                currentPurchased.add(upgradeId);
                latestGameState.purchasedUpgrades = Array.from(currentPurchased);

                if (upgrade.effect) {
                    const mockGameInstance = {
                        changeSanity: (amount) => { latestGameState.sanity = Math.max(0, Math.min(100, latestGameState.sanity + amount)); },
                        state: latestGameState
                    };
                    upgrade.effect(mockGameInstance);
                }
                
                // --- LÓGICA DE FEEDBACK ADICIONADA ---
                // Verifica qual item foi comprado para dar o feedback correto.
                if (upgradeId === 'coffee') {
                    showPurchaseFeedback("Você se sente um pouco mais lúcido. (+5 Sanidade)");
                } else {
                    showPurchaseFeedback(`"${upgrade.name}" adquirido!`);
                }
                
                localStorage.setItem('gameState', JSON.stringify(latestGameState));
                renderShop(latestGameState, shopElement); // Renderiza a loja novamente
            }
        });
    });
}
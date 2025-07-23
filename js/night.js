// js/night.js - VERSÃO COMPLETA E CORRIGIDA

// --- IMPORTS ---
// Importa os dados necessários para a página
import { LORE_PAGES } from '../js/data/loreData.js';
import { UPGRADES } from '../js/data/upgradeData.js';
// Importa as constantes para que a loja conheça as regras do jogo
import { MAX_INK, STARTING_INK_PER_DAY } from '../js/constants.js';

// --- FUNÇÃO DE FEEDBACK ---
let feedbackTimeout;
/**
 * Mostra uma mensagem de feedback na tela por alguns segundos.
 * @param {string} message - A mensagem a ser exibida.
 */
function showPurchaseFeedback(message) {
    const feedbackEl = document.getElementById('purchase-feedback');
    if (!feedbackEl) return;

    clearTimeout(feedbackTimeout);
    feedbackEl.textContent = message;
    feedbackEl.style.opacity = '1';

    feedbackTimeout = setTimeout(() => {
        feedbackEl.style.opacity = '0';
    }, 3500);
}

/**
 * Renderiza a loja de upgrades com base no estado atual do jogo.
 * @param {object} currentGameState - O estado atual do jogo.
 * @param {HTMLElement} shopElement - O elemento HTML onde a loja será renderizada.
 */
function renderShop(currentGameState, shopElement) {
    let shopHtml = '';
    const purchasedUpgrades = new Set(currentGameState.purchasedUpgrades || []);

    for (const key in UPGRADES) {
        const upgrade = UPGRADES[key];
        
        let isPurchased = purchasedUpgrades.has(key);
        let canAfford = currentGameState.money >= upgrade.cost;
        let buttonDisabled = '';
        let buttonText = `Comprar ($${upgrade.cost})`;

        // LÓGICA DE EXIBIÇÃO DO BOTÃO
        if (key === 'refill_ink') {
            isPurchased = false;
            buttonText = `Comprar Tinta ($${upgrade.cost})`;
            if (currentGameState.inkCharges >= MAX_INK) {
                buttonDisabled = 'disabled';
                buttonText = 'Tinteiro Cheio';
            } else if (!canAfford) {
                buttonDisabled = 'disabled';
            }
        } else if (key === 'coffee') {
            isPurchased = false;
            buttonText = `Tomar Café ($${upgrade.cost})`;
            if (!canAfford) {
                buttonDisabled = 'disabled';
            }
        } else { // Para upgrades permanentes
            if (isPurchased) {
                buttonDisabled = 'disabled';
                buttonText = 'Adquirido';
            } else if (!canAfford) {
                buttonDisabled = 'disabled';
            }
        }
        
        shopHtml += `
            <div class="upgrade-card">
                <h4>${upgrade.name}</h4>
                <p>${upgrade.description}</p>
                <button class="upgrade-btn" data-upgrade-id="${key}" ${buttonDisabled}>
                    ${buttonText}
                </button>
            </div>
        `;
    }
    
    shopElement.innerHTML = shopHtml;

    // --- LÓGICA DE CLIQUE CORRIGIDA ---
    shopElement.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const upgradeId = btn.dataset.upgradeId;
            const upgrade = UPGRADES[upgradeId];
            
            let latestGameState = JSON.parse(localStorage.getItem('gameState'));
            const currentPurchased = new Set(latestGameState.purchasedUpgrades || []);

            const isConsumable = upgradeId === 'refill_ink' || upgradeId === 'coffee';
            
            // CONDIÇÃO DE COMPRA:
            // 1. O jogador tem dinheiro?
            // 2. O item é consumível OU é um item permanente que ainda não foi comprado?
            if (latestGameState.money >= upgrade.cost && (isConsumable || !currentPurchased.has(upgradeId))) {
                latestGameState.money -= upgrade.cost;

                // Só adiciona a 'purchasedUpgrades' se for um upgrade permanente
                if (!isConsumable) {
                    currentPurchased.add(upgradeId);
                    latestGameState.purchasedUpgrades = Array.from(currentPurchased);
                }

                // Aplica o efeito do upgrade
                if (upgrade.effect) {
                    const mockGameInstance = {
                        changeSanity: (amount) => { latestGameState.sanity = Math.max(0, Math.min(100, latestGameState.sanity + amount)); },
                        state: latestGameState
                    };
                    upgrade.effect(mockGameInstance);
                }
                
                // Mostra o feedback correto
                if (upgradeId === 'coffee') {
                    showPurchaseFeedback("Você se sente um pouco mais lúcido. (+5 Sanidade)");
                } else if (upgradeId === 'refill_ink') {
                    showPurchaseFeedback("Você reabasteceu seu tinteiro.");
                } else {
                    showPurchaseFeedback(`"${upgrade.name}" adquirido!`);
                }
                
                // Salva o novo estado e renderiza a loja novamente
                localStorage.setItem('gameState', JSON.stringify(latestGameState));
                renderShop(latestGameState, shopElement);
            }
        });
    });
}

// --- PONTO DE ENTRADA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    let gameState = JSON.parse(localStorage.getItem('gameState'));
    if (!gameState) {
        console.error("Estado do jogo não encontrado! Redirecionando para o menu.");
        window.location.href = '/index.html';
        return;
    }
    
    // Atualiza o título da página
    const nightViewTitle = document.querySelector('#night-view-container h2');
    if (nightViewTitle) nightViewTitle.textContent = `Fim do Dia ${gameState.day}`;
    
    // Carrega a história (lore)
    const loreRevealElement = document.getElementById('lore-reveal');
    if (loreRevealElement) {
        loreRevealElement.innerHTML = LORE_PAGES[gameState.day] || "<h3>Noite Silenciosa</h3><p>Você limpa o estúdio e se prepara para o amanhã...</p>";
    }
    
    // Renderiza a loja
    const upgradesShopElement = document.getElementById('upgrades-shop');
    if (upgradesShopElement) {
        renderShop(gameState, upgradesShopElement);
    }
    
    // Configura o botão de avançar para o novo dia
    const startNewDayBtn = document.getElementById('start-new-day-btn');
    if (startNewDayBtn) {
        startNewDayBtn.addEventListener('click', () => {
            let finalGameState = JSON.parse(localStorage.getItem('gameState'));
            
            // Lógica de avanço de dia
            finalGameState.day += 1; 
            finalGameState.clientInDay = 0; 
            finalGameState.isNewDay = true; // Flag para o GameManager

            // Adiciona a tinta grátis do dia, respeitando o máximo
            finalGameState.inkCharges = Math.min(MAX_INK, (finalGameState.inkCharges || 0) + STARTING_INK_PER_DAY);
            
            // Garante que upgrades permaneçam como array no save
            finalGameState.purchasedUpgrades = Array.from(finalGameState.purchasedUpgrades || []);
            
            // Salva e redireciona
            localStorage.setItem('gameState', JSON.stringify(finalGameState));
            window.location.href = '/game.html';
        });
    }
});
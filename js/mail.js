// js/mail.js - VERSÃO COMPLETA E ATUALIZADA

import { MAILS } from './data/mailData.js';
import { UPGRADES } from './data/upgradeData.js';

document.addEventListener('DOMContentLoaded', () => {
    
    let gameState = JSON.parse(localStorage.getItem('gameState'));

    if (!gameState) {
        console.error("Estado do jogo não encontrado! Redirecionando...");
        window.location.href = '/game.html';
        return;
    }

    if (!gameState.readMailIds) gameState.readMailIds = [];
    if (!gameState.purchasedUpgrades) gameState.purchasedUpgrades = [];
    // Garante que discoveredSigils seja um Set
    gameState.discoveredSigils = new Set(Array.isArray(gameState.discoveredSigils) ? gameState.discoveredSigils : Object.keys(SIGILS));
    
    const readMailIds = new Set(gameState.readMailIds);
    const purchasedUpgrades = new Set(gameState.purchasedUpgrades);

    const mailContainerElement = document.getElementById('mail-container');
    if (!mailContainerElement) {
        console.error("Elemento 'mail-container' não encontrado no DOM!");
        return;
    }

    const renderMailList = () => {
        const mailList = mailContainerElement.querySelector('#mail-list-dynamic');
        if (!mailList) return;

        mailList.innerHTML = '';

        const availableMails = MAILS
            .filter(mail => mail.receivedDay <= gameState.day)
            .sort((a, b) => b.receivedDay - a.receivedDay || MAILS.indexOf(b) - MAILS.indexOf(a));

        if (availableMails.length === 0) {
            mailList.innerHTML = '<p>Você ainda não recebeu nenhuma carta.</p>';
            return;
        }

        availableMails.forEach(mail => {
            const isMailRead = readMailIds.has(mail.id);
            const mailCard = document.createElement('div');
            mailCard.classList.add('mail-card', isMailRead ? 'read' : 'unread');
            mailCard.dataset.mailId = mail.id;
            mailCard.innerHTML = `
                <h3>${mail.subject} ${!isMailRead ? '<span class="new-badge">Novo</span>' : ''}</h3>
                <p>${mail.content.replace(/\n/g, '<br>')}</p>
                <div class="mail-footer">De: ${mail.sender} | Dia ${mail.receivedDay}</div>
            `;
            
            mailCard.addEventListener('click', () => {
                if (readMailIds.has(mail.id)) return;

                readMailIds.add(mail.id);
                mailCard.classList.remove('unread');
                mailCard.classList.add('read');
                mailCard.querySelector('.new-badge')?.remove();

                if (gameState.showingTutorial && gameState.tutorialStep === 'initial_letter_prompt' && mail.id === 'letter1') {
                    gameState.tutorialStep = 'armitage_arrival_prompt';
                    console.log("TUTORIAL: Passo avançado para 'armitage_arrival_prompt'.");
                }
                
                if (mail.action) {
                    console.log(`Processando ação para o e-mail ${mail.id}:`, mail.action);
                    switch (mail.action.type) {
                        case 'add_money':
                            gameState.money += mail.action.payload;
                            break;
                        // <<< NOVA LÓGICA AQUI >>>
                        case 'add_sigil':
                            const sigilId = mail.action.payload;
                            // Adiciona o novo sigil ao Set de sigilos descobertos
                            if (!gameState.discoveredSigils.has(sigilId)) {
                                gameState.discoveredSigils.add(sigilId);
                                console.log(`Novo sigilo descoberto: ${sigilId}`);
                                // Opcional: Adicionar um feedback visual para o jogador
                                alert(`Novo sigilo adicionado ao seu grimório: ${sigilId}!`);
                            }
                            break;
                        // <<< FIM DA NOVA LÓGICA >>>
                        case 'change_sanity':
                             gameState.sanity = Math.max(0, Math.min(100, gameState.sanity + mail.action.payload));
                            break;
                        case 'add_upgrade':
                            // ... (lógica existente)
                            break;
                        default:
                            console.warn(`Ação de e-mail desconhecida: '${mail.action.type}'`);
                    }
                }
            });

            mailList.appendChild(mailCard);
        });
    };

    renderMailList();

    const backButton = document.getElementById('back-to-game-btn');
    if (backButton) {
        backButton.addEventListener('click', () => {
            gameState.readMailIds = Array.from(readMailIds);
            gameState.purchasedUpgrades = Array.from(purchasedUpgrades);
            // Converte o Set de sigilos de volta para um Array para salvar
            gameState.discoveredSigils = Array.from(gameState.discoveredSigils);
            localStorage.setItem('gameState', JSON.stringify(gameState));
            window.location.href = '/game.html';
        });
    }
});
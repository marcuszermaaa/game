// js/mail.js - VERSÃO COMPLETA E FINAL COM LÓGICA DE TUTORIAL

import { MAILS } from './data/mailData.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Mail.js] 🚀 Script iniciado.");

    let gameState = JSON.parse(localStorage.getItem('gameState'));

    if (!gameState) {
        console.error("❌ ERRO CRÍTICO em Mail.js: gameState não encontrado! Redirecionando...");
        alert("Erro: Não foi possível carregar os dados do jogo. Voltando ao menu.");
        window.location.href = '/index.html';
        return;
    }
    console.log("[Mail.js] ✅ gameState carregado:", gameState);

    // Garante que todas as propriedades necessárias existam no gameState
    gameState.readMailIds = gameState.readMailIds || [];
    gameState.purchasedUpgrades = gameState.purchasedUpgrades || [];
    gameState.discoveredSigils = gameState.discoveredSigils || [];
    gameState.specialItems = gameState.specialItems || [];

    // Converte os arrays para Sets para manipulação mais fácil e eficiente
    const readMailIds = new Set(gameState.readMailIds);
    const discoveredSigils = new Set(gameState.discoveredSigils);
    const specialItems = new Set(gameState.specialItems);

    const mailListElement = document.getElementById('mail-list-dynamic');
    if (!mailListElement) {
        console.error("❌ ERRO CRÍTICO em Mail.js: O elemento #mail-list-dynamic não foi encontrado!");
        return;
    }

    /**
     * Renderiza a lista de cartas disponíveis para o jogador.
     */
    const renderMailList = () => {
        console.log("[renderMailList] 🎨 Iniciando renderização dos e-mails...");
        mailListElement.innerHTML = ''; // Limpa a lista antes de redesenhar

        const availableMails = MAILS
            .filter(mail => mail.receivedDay <= gameState.day)
            .sort((a, b) => b.receivedDay - a.receivedDay);

        if (availableMails.length === 0) {
            mailListElement.innerHTML = '<p>Nenhuma carta recebida.</p>';
            return;
        }

        availableMails.forEach(mail => {
            const isRead = readMailIds.has(mail.id);
            const mailCard = document.createElement('div');
            mailCard.className = `mail-card ${isRead ? 'read' : 'unread'}`;
            mailCard.dataset.mailId = mail.id;
            mailCard.innerHTML = `<h3>${mail.subject} ${!isRead ? '<span class="new-badge">Novo</span>' : ''}</h3><p>${mail.content.replace(/\n/g, '<br>')}</p><div class="mail-footer">De: ${mail.sender} | Dia ${mail.receivedDay}</div>`;
            
            mailCard.addEventListener('click', () => {
                // Se a carta já foi lida, não fazemos nada.
                if (readMailIds.has(mail.id)) {
                    console.log(`[Mail Click] 🖱️ E-mail "${mail.id}" já foi lido. Nenhuma ação.`);
                    return;
                }

                console.log(`[Mail Click] 🖱️ Lendo e-mail "${mail.id}" pela primeira vez.`);
                readMailIds.add(mail.id);
                mailCard.classList.remove('unread');
                mailCard.classList.add('read');
                mailCard.querySelector('.new-badge')?.remove();

                // ✨ LÓGICA DO TUTORIAL INTEGRADA AQUI ✨
                // Verifica se o tutorial está ativo e se a carta lida é a primeira carta do tutorial.
                if (gameState.showingTutorial && mail.id === 'letter1') {
                    // Se for, avança o passo do tutorial para o próximo estágio.
                    gameState.tutorialStep = 'armitage_arrival_prompt';
                    console.log("🎓 Tutorial: Passo avançado para 'armitage_arrival_prompt' após ler a carta.");
                }
                
                // Processa qualquer ação associada à carta.
                if (mail.action) {
                    console.log(`⚡ Processando ação para o e-mail:`, mail.action);
                    switch (mail.action.type) {
                        case 'add_money':
                            gameState.money = (gameState.money || 0) + mail.action.payload;
                            break;
                        case 'add_sigil':
                            discoveredSigils.add(mail.action.payload);
                            break;
                        case 'change_sanity':
                            gameState.sanity = Math.max(0, Math.min(100, (gameState.sanity || 100) + mail.action.payload));
                            break;
                        case 'add_upgrade':
                            // Adiciona o upgrade ao gameState.purchasedUpgrades, que já é um Set.
                            // Precisaremos convertê-lo de volta para array ao salvar.
                            // Esta lógica assume que o gameState.purchasedUpgrades já foi inicializado como um Set.
                            // Se não, seria necessário: const upgrades = new Set(gameState.purchasedUpgrades); upgrades.add...
                            gameState.purchasedUpgrades.add(mail.action.payload);
                            break;
                        case 'add_special_item':
                            specialItems.add(mail.action.payload);
                            console.log(`[Mail.js] Item especial adicionado: ${mail.action.payload}`);
                            break;
                        default:
                            console.warn(`❓ Ação de e-mail desconhecida: '${mail.action.type}'`);
                    }
                }
            });
            mailListElement.appendChild(mailCard);
        });
        console.log("[renderMailList] ✅ Renderização concluída.");
    };

    renderMailList();

    const backButton = document.getElementById('back-to-game-btn');
    if (backButton) {
        backButton.addEventListener('click', () => {
            console.log("[Back Button] 📤 Preparando para salvar o estado e voltar...");
            
            // Converte os Sets de volta para Arrays para que possam ser salvos corretamente no JSON.
            gameState.readMailIds = Array.from(readMailIds);
            gameState.purchasedUpgrades = Array.from(new Set(gameState.purchasedUpgrades)); // Garante que a conversão seja segura
            gameState.discoveredSigils = Array.from(discoveredSigils);
            gameState.specialItems = Array.from(specialItems);
            
            console.log("[Back Button] 💾 Estado final a ser salvo:", gameState);
            localStorage.setItem('gameState', JSON.stringify(gameState));
            
            window.location.href = '/game.html';
        });
    }
});
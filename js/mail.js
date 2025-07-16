// js/mail.js - Lógica para a visualização de cartas recebidas.

// --- IMPORTS ---
import { MAILS } from './data/mailData.js'; // Importa os dados das cartas.

// Verifica se MAILS foi importado corretamente.
if (typeof MAILS === 'undefined') {
    console.error("ERRO CRÍTICO: MAILS não está definido! Certifique-se de que mailData.js está no caminho correto e sendo carregado.");
}

// Executa o código após o DOM estar completamente carregado.
document.addEventListener('DOMContentLoaded', () => {
    // Carrega o estado do jogo do localStorage.
    let gameState = JSON.parse(localStorage.getItem('gameState'));

    // Validação: Se o estado do jogo não for encontrado, redireciona para a página principal.
    if (!gameState) {
        console.error("Estado do jogo não encontrado no localStorage! Não é possível carregar as cartas.");
        window.location.href = '/game.html';
        return;
    }

    // Garante que gameState.readMailIds seja um array, se não existir.
    if (!gameState.readMailIds) {
        gameState.readMailIds = [];
    }
    const readMailIds = new Set(gameState.readMailIds);

    // --- ALTERAÇÃO ---
    // Corrigido o ID para corresponder ao HTML padrão.
    const mailContainerElement = document.getElementById('mail-container');
    if (!mailContainerElement) {
        // Adicionado um h1 para o caso de o elemento principal não ser encontrado.
        document.body.innerHTML = '<h1>Erro: Container de e-mail não encontrado. Verifique o ID no seu arquivo mail.html.</h1>';
        console.error("Elemento 'mail-container' não encontrado no DOM!");
        return;
    }

    // --- Elementos do Modal (Adicionados) ---
    const modalOverlay = document.getElementById('messageModalOverlay');
    const closeModalButton = document.getElementById('closeModalButton');
    const modalContentArea = document.getElementById('modalContentArea');

    // --- Funções do Modal (Adicionadas) ---
    function openMessageModal(title, content) {
        modalContentArea.innerHTML = `<h2>${title}</h2>${content}`;
        modalOverlay.style.display = 'flex';
        modalContentArea.scrollTop = 0; // Reinicia a rolagem do modal
    }

    function closeMessageModal() {
        modalOverlay.style.display = 'none';
    }

    // Atribui evento de clique para fechar o modal (Adicionado)
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

    /**
     * Renderiza as cartas recebidas na lista.
     */
    const renderMailList = () => {
        // Limpa apenas o conteúdo do container, mantendo o título.
        const mailList = mailContainerElement.querySelector('#mail-list-dynamic');
        if (mailList) {
            mailList.innerHTML = '';
        } else {
            console.error("Elemento para a lista dinâmica de e-mails não encontrado.");
            return;
        }

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
            mailCard.classList.add('mail-card');
            if (isMailRead) {
                mailCard.classList.add('read');
            }
             if (!isMailRead) {
                mailCard.classList.add('unread'); // Adiciona classe para novos e-mails
            }
            mailCard.dataset.mailId = mail.id;

            mailCard.innerHTML = `
                <h3>${mail.subject} ${!isMailRead ? '<span class="new-badge">Novo</span>' : ''}</h3>
                <div class="mail-footer">
                    De: ${mail.sender} | Dia ${mail.receivedDay}
                </div>
            `;

            mailCard.addEventListener('click', () => {
                // Abre o modal com o conteúdo da carta
                openMessageModal(mail.subject, mail.content.replace(/\n/g, '<br>'));

                if (isMailRead) return; // Não faz nada se o e-mail já foi lido.

                readMailIds.add(mail.id); // Adiciona ao Set de e-mails lidos.

                // Atualiza visualmente
                mailCard.classList.remove('unread');
                mailCard.classList.add('read');
                mailCard.querySelector('.new-badge')?.remove();

                // Atualiza o tutorial, se aplicável
                if (gameState.showingTutorial && gameState.tutorialStep === 'initial_mail' && mail.id === 'letter1') {
                    gameState.tutorialStep = 'read_mail_then_diary';
                    console.log("Tutorial avançado para: read_mail_then_diary");
                }

                console.log(`E-mail ${mail.id} marcado como lido.`);
            });

            mailList.appendChild(mailCard);
        });
    };

    renderMailList();

    const backButton = document.getElementById('back-to-game-btn');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // Atualiza o gameState com a lista final de e-mails lidos antes de sair.
            gameState.readMailIds = Array.from(readMailIds);

            // Salva o gameState no localStorage.
            localStorage.setItem('gameState', JSON.stringify(gameState));
            console.log("Voltando ao jogo. Estado com e-mails lidos foi salvo.");
            window.location.href = '/game.html';
        });
    }
});
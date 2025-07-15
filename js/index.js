document.addEventListener('DOMContentLoaded', () => {
const startGameBtn = document.getElementById('start-game-btn');
const continueGameBtn = document.getElementById('continue-game-btn');
const clearSaveBtn = document.getElementById('clear-save-btn');
const menuOptionsDiv = document.getElementById('menu-options');
//Elemento para mensagens gerais
let messageDisplay = document.createElement('h2');
messageDisplay.id = 'menu-message';

//Elemento para mensagens de confirmação de limpeza
let confirmationMessage = null;
let isConfirmingClear = false;// Flag para controlar o estado de confirmação

//Função para exibir mensagens gerais na tela
const displayGeneralMessage = (msg, isError = false) => {
   //Remove qualquer mensagem de confirmação anterior
    if (confirmationMessage) {
        confirmationMessage.remove();
        confirmationMessage = null;
        isConfirmingClear = false;//eseta o flag
    }
   //Remove qualquer mensagem geral anterior
    const existingGeneralMessage = document.getElementById('menu-message');
    if (existingGeneralMessage) {
        existingGeneralMessage.remove();
    }

    messageDisplay = document.createElement('h2');//Recria o elemento para garantir que está limpo
    messageDisplay.id = 'menu-message';
    messageDisplay.textContent = msg;
    if (isError) {
        messageDisplay.style.color = 'red';
    } else {
        messageDisplay.style.color = '';
    }

    if (menuOptionsDiv) {
        menuOptionsDiv.insertAdjacentElement('afterend', messageDisplay);
    }
};

//Função para exibir a mensagem de confirmação e habilitar o piscar
const displayConfirmationMessage = () => {
    if (!confirmationMessage) {
        confirmationMessage = document.createElement('h2');
        confirmationMessage.id = 'confirmation-message';
        confirmationMessage.style.color = '#ffcc00';//Amarelo para destaque
        confirmationMessage.style.fontWeight = 'bold';
        confirmationMessage.style.animation = 'blink-animation 1s infinite';// Aplica a animação de piscar
        confirmationMessage.textContent = "Tem certeza que deseja apagar o progresso do jogo salvo? Clique novamente em 'Limpar Jogo Salvo' para confirmar.";

        if (menuOptionsDiv) {
            menuOptionsDiv.insertAdjacentElement('afterend', confirmationMessage);
        }
    }
    isConfirmingClear = true;//Marca que estamos no modo de confirmação
   // Certifica-se de que o botão de limpar não está desabilitado durante a confirmação
    if (clearSaveBtn) clearSaveBtn.disabled = false;
};

const startGame = () => {
    console.log("Iniciando um novo jogo: Limpando save e redirecionando para introdução.");
    localStorage.removeItem('gameState');
    displayGeneralMessage("Novo jogo iniciado. Redirecionando...");
    setTimeout(() => {
        window.location.href = '/intro.html?newGame=true';
    }, 1000);
};

const continueGame = () => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        console.log("Continuando jogo salvo.");
        displayGeneralMessage("Continuando jogo salvo. Redirecionando...");
        setTimeout(() => {
            window.location.href = '/game.html';
        }, 1000);
    } else {
        displayGeneralMessage("Nenhum jogo salvo encontrado. Comece um novo jogo!", true);
    }
};

const performClearSavedGame = () => {
    localStorage.removeItem('gameState');
    displayGeneralMessage("Jogo salvo apagado com sucesso. Seu progresso foi resetado.");
    updateButtonStates();// Atualiza o estado dos botões
    isConfirmingClear = false;// Sai do modo de confirmação
    if (confirmationMessage) {
        confirmationMessage.remove();// Remove a mensagem de confirmação
        confirmationMessage = null;
    }
};

const handleClearSaveClick = () => {
    if (isConfirmingClear) {
       //Se já estamos no modo de confirmação, o segundo clique executa a limpeza
        performClearSavedGame();
    } else {
       //Se não estamos confirmando, exibimos a mensagem de confirmação
        displayConfirmationMessage();
    }
};

const updateButtonStates = () => {
    const savedState = localStorage.getItem('gameState');
    if (continueGameBtn) {
        continueGameBtn.disabled = !savedState;
    }

   //Remove a mensagem de confirmação se ela ainda existir quando o estado mudar
    if (isConfirmingClear && !savedState) {
        if (confirmationMessage) {
            confirmationMessage.remove();
            confirmationMessage = null;
        }
        isConfirmingClear = false;
    }

   //Define a mensagem inicial geral
    if (!document.getElementById('menu-message') || !document.getElementById('menu-message').textContent) {
         if (savedState) {
            displayGeneralMessage("Um jogo salvo foi encontrado. Você pode continuar.");
        } else {
            displayGeneralMessage("Nenhum jogo salvo encontrado. Comece um novo jogo.");
        }
    }
};

//Adiciona os event listeners
if (startGameBtn) startGameBtn.addEventListener('click', startGame);
if (continueGameBtn) continueGameBtn.addEventListener('click', continueGame);
if (clearSaveBtn) clearSaveBtn.addEventListener('click', handleClearSaveClick);//Mudei para handleClearSaveClick

//Chama a função para definir o estado inicial
updateButtonStates();
});

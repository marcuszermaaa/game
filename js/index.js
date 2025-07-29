// /js/index.js - VERSÃO FINAL COM DEBUG DE DINHEIRO

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DE ELEMENTOS ---
    const elements = {
        startGameBtn: document.getElementById('start-game-btn'),
        continueGameBtn: document.getElementById('continue-game-btn'),
        clearSaveBtn: document.getElementById('clear-save-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        menuOptions: document.getElementById('menu-options'),
        settingsPanel: document.getElementById('settings-panel'),
        saveSettingsBtn: document.getElementById('save-settings-btn'),
        zoomSelect: document.getElementById('zoom-level-select'),
        // ✨ Novos elementos de debug
        moneyInput: document.getElementById('money-input'),
        addMoneyBtn: document.getElementById('add-money-btn'),
    };

    let feedbackMessageElement = null;

    // --- 2. FUNÇÕES DE LÓGICA ---

    const updateButtonStates = () => {
        const hasSave = localStorage.getItem('gameState') !== null;
        if (elements.continueGameBtn) elements.continueGameBtn.disabled = !hasSave;
        if (elements.clearSaveBtn) elements.clearSaveBtn.disabled = !hasSave;
        // ✨ Desabilita o botão de dinheiro se não houver save
        if (elements.addMoneyBtn) elements.addMoneyBtn.disabled = !hasSave;
        if (elements.moneyInput) elements.moneyInput.disabled = !hasSave;
    };

    const displayFeedbackMessage = (text, duration = 3000) => {
        if (feedbackMessageElement) feedbackMessageElement.remove();
        feedbackMessageElement = document.createElement('h2');
        feedbackMessageElement.className = 'feedback-message';
        feedbackMessageElement.textContent = text;
        const referenceNode = elements.settingsPanel.style.display === 'none' ? elements.menuOptions : elements.settingsPanel;
        referenceNode.insertAdjacentElement('afterend', feedbackMessageElement);
        setTimeout(() => {
            if (feedbackMessageElement) feedbackMessageElement.remove();
            feedbackMessageElement = null;
        }, duration);
    };

    const loadSettings = () => {
        const savedZoom = localStorage.getItem('gameZoomLevel');
        if (savedZoom && elements.zoomSelect) {
            elements.zoomSelect.value = savedZoom;
        }
    };
    
    // --- 3. AÇÕES DOS BOTÕES ---

    const onStartGame = () => {
        localStorage.removeItem('gameState');
        displayFeedbackMessage("Iniciando nova aventura...");
        setTimeout(() => window.location.href = '/intro.html?newGame=true', 1000);
    };

    const onContinueGame = () => {
        displayFeedbackMessage("Carregando jogo salvo...");
        setTimeout(() => window.location.href = '/game.html', 1000);
    };

    const onClearSave = () => {
        if (elements.clearSaveBtn.dataset.confirming === 'true') {
            localStorage.removeItem('gameState');
            displayFeedbackMessage("Jogo salvo apagado.");
            elements.clearSaveBtn.dataset.confirming = 'false';
            elements.clearSaveBtn.textContent = 'Limpar Jogo Salvo';
            updateButtonStates();
        } else {
            displayFeedbackMessage("Tem certeza? Clique novamente para apagar.", 5000);
            elements.clearSaveBtn.dataset.confirming = 'true';
            elements.clearSaveBtn.textContent = 'CONFIRMAR LIMPEZA';
        }
    };

    const onOpenSettings = () => {
        elements.menuOptions.style.display = 'none';
        elements.settingsPanel.style.display = 'block';
    };

    const onSaveSettings = () => {
        localStorage.setItem('gameZoomLevel', elements.zoomSelect.value);
        displayFeedbackMessage("Configurações salvas!");
        elements.settingsPanel.style.display = 'none';
        elements.menuOptions.style.display = 'block';
    };

    // ✨ Nova função para adicionar dinheiro
    const onAddMoney = () => {
        const savedStateJSON = localStorage.getItem('gameState');
        if (!savedStateJSON) {
            displayFeedbackMessage("Nenhum jogo salvo para adicionar dinheiro!", 3000);
            return;
        }
        
        try {
            const amount = parseInt(elements.moneyInput.value, 10);
            if (isNaN(amount)) {
                displayFeedbackMessage("Por favor, insira um número válido.", 3000);
                return;
            }

            const gameState = JSON.parse(savedStateJSON);
            gameState.money = (gameState.money || 0) + amount;
            localStorage.setItem('gameState', JSON.stringify(gameState));
            
            displayFeedbackMessage(`$${amount} adicionado com sucesso!`);
        } catch (e) {
            displayFeedbackMessage("Erro ao modificar o jogo salvo.", 3000);
            console.error("Erro ao parsear ou salvar o gameState:", e);
        }
    };


    // --- 4. INICIALIZAÇÃO ---
    const init = () => {
        elements.startGameBtn?.addEventListener('click', onStartGame);
        elements.continueGameBtn?.addEventListener('click', onContinueGame);
        elements.clearSaveBtn?.addEventListener('click', onClearSave);
        elements.settingsBtn?.addEventListener('click', onOpenSettings);
        elements.saveSettingsBtn?.addEventListener('click', onSaveSettings);
        // ✨ Vincula a nova função ao botão
        elements.addMoneyBtn?.addEventListener('click', onAddMoney);

        updateButtonStates();
        loadSettings();
        
        if (!localStorage.getItem('gameState')) {
            displayFeedbackMessage("Nenhum jogo salvo. Comece uma nova aventura.");
        }
    };
    
    init();
});
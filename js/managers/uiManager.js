// js/managers/uiManager.js - VERSÃO COMPLETA COM SEQUÊNCIAS NARRATIVAS MULTI-ESTÁGIO

import { CLIENTS_PER_DAY } from '../constants.js';

export class UIManager {
    constructor(domRefs, gameState, gameInstance) {
        this.dom = domRefs;
        this.gameState = gameState;
        this.game = gameInstance;
        
        // Mapeamento de elementos específicos adicionais
        this.dom.upgradeLupaIcon = document.getElementById('upgrade-lupa-icon');
        this.dom.upgradeLampIcon = document.getElementById('upgrade-lamp-icon');
        this.dom.upgradeBraceIcon = document.getElementById('upgrade-brace-icon');
        this.dom.spriteA = document.getElementById('character-sprite-a');
        this.dom.spriteB = document.getElementById('character-sprite-b');
        this.dom.infoPanelBottomGraphic = document.querySelector('.info-panel-bottom-graphic'); 
        
        this.activeSprite = null;
        this.typewriterInterval = null;

        console.log("UIManager inicializado com sucesso.");
    }
    
    // --- FUNÇÃO PARA BLOQUEAR/DESBLOQUEAR ÍCONES ---
    setIconsLocked(isLocked) {
        this.dom.itemMail?.classList.toggle('icon-disabled', isLocked);
        this.dom.itemBook?.classList.toggle('icon-disabled', isLocked);
        this.dom.itemWorkbench?.classList.toggle('icon-disabled', isLocked);
    }
    
    // --- FUNÇÕES AUXILIARES INTERNAS ---

    _typewriteText(element, text, speed = 35) {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }

        if (!element) {
            console.error("UIManager: Elemento para typewrite não foi encontrado.");
            return;
        }
        element.textContent = '';

        let i = 0;
        this.typewriterInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
            }
        }, speed);
    }

    _setSpriteWithCrossFade(imageUrl) {
        const newSprite = (this.activeSprite === this.dom.spriteA) ? this.dom.spriteB : this.dom.spriteA;
        
        if (newSprite) {
            newSprite.style.backgroundImage = `url('${imageUrl}')`;
            newSprite.style.display = 'block';
            newSprite.style.opacity = '1';
        }

        if (this.activeSprite) {
            this.activeSprite.style.opacity = '0';
        }

        this.activeSprite = newSprite;
    }

    _cleanAllHighlights() {
        console.log("[UIManager] Limpando TODOS os destaques de ícones.");
        this.dom.itemMail?.classList.remove('highlight-pulse');
        this.dom.itemBook?.classList.remove('highlight-pulse');
        this.dom.itemWorkbench?.classList.remove('highlight-pulse');
    }
    
    // --- FUNÇÕES DE EXIBIÇÃO DE CENAS E TUTORIAL ---

    // ✨ NOVA FUNÇÃO PARA SEQUÊNCIAS NARRATIVAS ✨
    /**
     * Exibe uma sequência narrativa multi-estágio para um personagem.
     * @param {object} characterData - Os dados completos do cliente/personagem.
     * @param {function} onSequenceComplete - O callback a ser executado QUANDO a sequência inteira terminar.
     */
    displayNarrativeSequence(characterData, onSequenceComplete) {
        // Valida se os dados da sequência existem
        if (!characterData || !characterData.narrativeSequence || characterData.narrativeSequence.length === 0) {
            console.error("UIManager: Tentou iniciar sequência narrativa, mas os dados estão ausentes ou inválidos em clientData.js.");
            onSequenceComplete(); // Executa o callback para não travar o jogo.
            return;
        }

        let currentStageIndex = 0;
        const sequence = characterData.narrativeSequence;

        // Função interna para mostrar um estágio específico
        const showStage = (index) => {
            // Se a sequência terminou, executa o callback final e para.
            if (index >= sequence.length) {
                onSequenceComplete();
                return;
            }

            const stage = sequence[index];
            // Seleciona o retrato correto para este estágio, com um fallback para o primeiro retrato
            const portraitUrl = characterData.portraitUrls[stage.portraitIndex] || characterData.portraitUrls[0];

            // Atualiza a UI para o estágio atual
            this.updateCharacterSprite({ portraitUrls: [portraitUrl] });
            this._typewriteText(this.dom.eventDialogue, `'${stage.text}'`);
            
            // Configura o botão "Continuar" para chamar o próximo estágio
            if (this.dom.actionPanel) {
                this.dom.actionPanel.innerHTML = `<button id="narrative-continue-btn">Continuar</button>`;
                document.getElementById('narrative-continue-btn').addEventListener('click', () => {
                    showStage(index + 1); // Chama a si mesma para o próximo índice
                }, { once: true });
            }
        };
        
        // Inicia a exibição com o primeiro estágio (índice 0)
        this.clearActionPanel();
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = characterData.name;
        showStage(currentStageIndex);
    }

    highlightWorkbenchIcon() {
        this._cleanAllHighlights(); // Limpa outros destaques primeiro.
        if (this.dom.itemWorkbench) {
            console.log("[UIManager] ADICIONANDO destaque 'highlight-pulse' ao ícone da bancada.");
            this.dom.itemWorkbench.classList.add('highlight-pulse');
        } else {
            console.error("[UIManager] Erro: Tentou destacar a bancada, mas o elemento 'item-workbench' não foi encontrado.");
        }
    }

    showTutorialStep_LetterPrompt() {
        this.hideCharacterSprite();
        this.clearActionPanel();
        this.hideInfoPanel();
        this._cleanAllHighlights();
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Estúdio Empoeirado";
        this._typewriteText(this.dom.eventDialogue, "Você finalmente chega ao estúdio de seu falecido tio. Sobre o balcão, uma única carta selada aguarda.");
        if (this.dom.itemMail) this.dom.itemMail.classList.add('highlight-pulse');
    }

    showTutorialStep_JournalPrompt() {
        this.hideCharacterSprite();
        this.clearActionPanel();
        this.hideInfoPanel();
        this._cleanAllHighlights();
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "A Herança de Abner";
        this._typewriteText(this.dom.eventDialogue, "O Professor o instruiu a estudar o grimório. Parece ser a única pista que você tem.");
        if (this.dom.itemBook) this.dom.itemBook.classList.add('highlight-pulse');
    }

    showTutorialStep_ArmitageArrival(onAttendCallback) {
        this.showSilhouetteSprite();
        this.clearActionPanel();
        this.hideInfoPanel();
        this._cleanAllHighlights();
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Uma Visita Inesperada";
        this._typewriteText(this.dom.eventDialogue, "Mal você lê a carta de seu tio, o sino da porta soa, anunciando a chegada de alguém.");
        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="attend-btn-tutorial">Atender</button>`;
            document.getElementById('attend-btn-tutorial')?.addEventListener('click', onAttendCallback, { once: true });
        }
    }

    showTutorialStep_ArmitageDialogue(characterData, onContinueCallback) {
        // Para o tutorial, que é simples, a nova função de sequência pode não ser necessária
        // a menos que você queira expandir este diálogo também.
        this.updateCharacterSprite(characterData);
        this.clearActionPanel();
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = characterData.name;
        this._typewriteText(this.dom.eventDialogue, `'${characterData.problem}'`);
        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="narrative-continue-btn">Ouvir o Professor...</button>`;
            document.getElementById('narrative-continue-btn')?.addEventListener('click', onContinueCallback, { once: true });
        }
    }

    showTutorialStep_FinalWait(onAttendCallback) {
        this.showSilhouetteSprite();
        this.clearActionPanel();
        this.hideInfoPanel();
        this._cleanAllHighlights();
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Momento de Calma";
        this._typewriteText(this.dom.eventDialogue, "Com o grimório de seu tio em mãos, você agora tem uma noção do que o espera. O silêncio é quebrado mais uma vez pelo sino da porta.");
        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="attend-btn-final">Atender</button>`;
            document.getElementById('attend-btn-final')?.addEventListener('click', onAttendCallback, { once: true });
        }
    }
    
    // --- ATUALIZAÇÕES GERAIS DA UI ---
    
    updateCoreUIElements(hasUnreadMail) {
        if (this.dom.upgradeLupaIcon) this.dom.upgradeLupaIcon.classList.toggle('active', this.gameState.purchasedUpgrades.has('lupa_analise'));
        if (this.dom.upgradeLampIcon) this.dom.upgradeLampIcon.classList.toggle('active', this.gameState.purchasedUpgrades.has('lamp'));
        if (this.dom.upgradeBraceIcon) this.dom.upgradeBraceIcon.classList.toggle('active', this.gameState.purchasedUpgrades.has('brace'));
        if (this.dom.itemMail) this.dom.itemMail.classList.toggle('highlight-pulse', hasUnreadMail);
    }
    
    updateCharacterSprite(client) {
        const shouldShow = client?.portraitUrls?.length > 0;
        if (shouldShow) {
            this._setSpriteWithCrossFade(client.portraitUrls[0]);
        } else {
            this.hideCharacterSprite();
        }
    }
    
    showSilhouetteSprite() { this._setSpriteWithCrossFade('/media/img/background_cliente_sombra.png'); }
    hideCharacterSprite() { if (this.dom.spriteA) this.dom.spriteA.style.opacity = '0'; if (this.dom.spriteB) this.dom.spriteB.style.opacity = '0'; this.activeSprite = null; }

    showInfoPanel(config) {
        const panel = this.dom.infoPanel;
        const bottomGraphic = this.dom.infoPanelBottomGraphic; 
        if (!panel) return;
        let contentHTML = '';
        if (config.icon) contentHTML += `<img src="${config.icon}" alt="ícone" class="info-panel-icon">`;
        if (config.title) contentHTML += `<h4 class="info-panel-title">${config.title}</h4>`;
        if (config.button) contentHTML += `<button id="${config.button.id}">${config.button.text}</button>`;
        panel.innerHTML = contentHTML;
        const buttonElement = panel.querySelector('button');
        if (buttonElement && config.button.callback) {
            buttonElement.addEventListener('click', () => { this.hideInfoPanel(); config.button.callback(); }, { once: true });
        }
        panel.style.display = 'flex'; 
        if (bottomGraphic) bottomGraphic.classList.add('active');
    }

    hideInfoPanel() {
        if (this.dom.infoPanel) { this.dom.infoPanel.style.display = 'none'; this.dom.infoPanel.innerHTML = ''; }
        if (this.dom.infoPanelBottomGraphic) this.dom.infoPanelBottomGraphic.classList.remove('active');
    }
    
    resetClientInterface() {
        const client = this.game.clientManager.getCurrentClient();
        if (!client) {
            this.hideCharacterSprite();
            if (this.dom.eventClientName) this.dom.eventClientName.textContent = "";
            if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = "Aguardando...";
            return;
        }
        this._cleanAllHighlights();
        this.hideInfoPanel(); 
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = client.name;
        // Se for um evento narrativo, usa o primeiro texto da sequência. Senão, usa 'problem'.
        const initialText = client.narrativeSequence ? client.narrativeSequence[0].text : client.problem;
        this._typewriteText(this.dom.eventDialogue, `'${initialText}'`);
        this.updateCharacterSprite(client);
    }
    
    showStartDayView(startCallback) {
        this.clearActionPanel();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        this.showSilhouetteSprite();
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Novo Dia";
        this._typewriteText(this.dom.eventDialogue, "As brumas da manhã se dissipam. Você ouve o sino da porta tocar...");
        this.showInfoPanel({
            title: 'Cliente à Espera',             
            button: { id: 'attend-client-btn', text: 'Atender Cliente', callback: startCallback }
        });
    }

    showOutcomeView(title, text, nextActionCallback) {
        this.hideCharacterSprite();
        this.clearActionPanel();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = title;
        this._typewriteText(this.dom.eventDialogue, text);
        this.showInfoPanel({
            title: 'Resultado',         
            button: { id: 'next-action-btn', text: 'Próximo', callback: nextActionCallback }
        });
        this.setIconsLocked(true);
    }
    showMultiOptionPanel(config) {
    const panel = this.dom.infoPanel;
    const bottomGraphic = this.dom.infoPanelBottomGraphic; 
    if (!panel) return;

    let contentHTML = '';
    if (config.title) contentHTML += `<h4 class="info-panel-title">${config.title}</h4>`;
    if (config.text) contentHTML += `<p class="info-panel-text">${config.text}</p>`;
    
    if (config.options && config.options.length > 0) {
        config.options.forEach((option, index) => {
            const styleClass = option.style === 'danger' ? 'btn-danger' : '';
            contentHTML += `<button id="multi-option-btn-${index}" class="${styleClass}">${option.text}</button>`;
        });
    }

    panel.innerHTML = contentHTML;
    
    config.options.forEach((option, index) => {
        const buttonElement = panel.querySelector(`#multi-option-btn-${index}`);
        if (buttonElement && option.callback) {
            buttonElement.addEventListener('click', () => { 
                this.hideInfoPanel(); 
                option.callback(); 
            }, { once: true });
        }
    });

    panel.style.display = 'flex';
    if (bottomGraphic) bottomGraphic.classList.add('active');
}

    showNextClientTransition(message, buttonText, callback) {
        console.log("[UIManager] Mostrando transição para o próximo cliente.");
        this.hideCharacterSprite();
        this.clearActionPanel();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Momento de Calma";
        if (this.dom.eventDialogue) this._typewriteText(this.dom.eventDialogue, message);
        this.showInfoPanel({
            title: 'Aguardando...',
            button: { id: 'next-client-transition-btn', text: buttonText, callback: callback }
        });
    }

    updateActionButtonBasedOnState() {
        if (!this.dom.actionPanel) return;
        const client = this.game.clientManager.getCurrentClient();
        let buttonConfig = null;
        
        this.dom.itemBook?.classList.remove('highlight-pulse');
        this.dom.itemBook?.classList.toggle('icon-disabled', !!this.gameState.playerSigilChoice);

        if (!client) {
            buttonConfig = null;
        } else if (this.gameState.playerSigilChoice) {
            buttonConfig = { id: 'start-tattoo-btn', text: 'Iniciar Tatuagem', onClick: () => this.game.startMinigame() };
        } else if (client.request) {
            buttonConfig = { id: 'analyze-request-btn', text: 'Analisar o Pedido', onClick: () => this.game.startAnalysisProcess() };
        } else {
            buttonConfig = null;
            if (this.dom.itemBook) this.dom.itemBook.classList.add('highlight-pulse');
        }
        
        this.clearActionPanel();
        if (buttonConfig) {
            this.dom.actionPanel.innerHTML = `<button id="${buttonConfig.id}">${buttonConfig.text}</button>`;
            document.getElementById(buttonConfig.id)?.addEventListener('click', buttonConfig.onClick);
        }
    }

    updateStats() {
 if (this.dom.dayStat) this.dom.dayStat.textContent = `Dia: ${this.gameState.day}`;
        
        // ✨ LÓGICA CORRIGIDA ✨
        // Pede ao ClientManager o número real de clientes para o dia atual.
        const totalClientsForToday = this.game.clientManager.getClientsForDay(this.gameState.day).length;
        if (this.dom.clientStat) this.dom.clientStat.textContent = `Cliente: ${this.gameState.clientInDay}/${totalClientsForToday}`;
        if (this.dom.moneyValue) this.dom.moneyValue.textContent = this.gameState.money;
        if (this.dom.sanityProgressBar) {
            const sanityPercent = (this.gameState.sanity / 100) * 100;
            this.dom.sanityProgressBar.style.width = `${Math.max(0, sanityPercent)}%`;
        }
        if (this.dom.inkValue) this.dom.inkValue.textContent = this.gameState.inkCharges;
           this.dom.inkValue.parentElement.classList.toggle('no-ink', this.gameState.inkCharges <= 0);
    }

    clearActionPanel() {
        if (this.dom.actionPanel) this.dom.actionPanel.innerHTML = '';
    }

    showEndGameView(reason, restartCallback) {
        this.hideCharacterSprite();
        this.clearActionPanel();
        this.hideInfoPanel();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'block';
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Fim do Capítulo";
        if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = "";
        if (this.dom.dialogueText) this.dom.dialogueText.textContent = reason;
        if (this.dom.dialogueOptionsContainer) {
            this.dom.dialogueOptionsContainer.innerHTML = `<button id="restart-btn">Jogar Novamente</button>`;
            document.getElementById('restart-btn')?.addEventListener('click', restartCallback);
        }
    }

    displayDialogue(nodeData, client) {
        if (!this.dom.dialogueInteractionPanel || !this.dom.dialogueText || !this.dom.dialogueOptionsContainer) return;
        this.dom.dialogueInteractionPanel.style.display = 'block';
        this.dom.dialogueText.textContent = nodeData.text;
        let optionsHTML = '';
        nodeData.options.forEach((option, index) => {
            optionsHTML += `<button class="dialogue-option-btn" data-index="${index}">${option.text}</button>`;
        });
        this.dom.dialogueOptionsContainer.innerHTML = optionsHTML;
        this.dom.dialogueOptionsContainer.querySelectorAll('.dialogue-option-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const optionIndex = parseInt(e.target.dataset.index);
                const chosenOption = nodeData.options[optionIndex];
                if (chosenOption.action) this.game.dialogueManager.processDialogueAction(chosenOption.action);
                if (chosenOption.nextNode) {
                    const nextNode = this.game.dialogueManager.getDialogueNode(client.id, chosenOption.nextNode);
                    if (nextNode) this.displayDialogue(nextNode, client);
                    else this.handleDialogueEnd();
                } else {
                    this.handleDialogueEnd();
                }
            });
        });
    }

    handleDialogueEnd() {
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        this.updateActionButtonBasedOnState();
    }
}
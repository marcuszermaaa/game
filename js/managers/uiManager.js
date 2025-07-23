// js/managers/UIManager.js - VERSÃO COMPLETA E CORRIGIDA

import { CLIENTS_PER_DAY } from '../constants.js';

export class UIManager {
    constructor(domRefs, gameState, gameInstance) {
        this.dom = domRefs;
        this.gameState = gameState;
        this.game = gameInstance;
        
        this.dom.upgradeLupaIcon = document.getElementById('upgrade-lupa-icon');
        this.dom.upgradeLampIcon = document.getElementById('upgrade-lamp-icon');
        this.dom.upgradeBraceIcon = document.getElementById('upgrade-brace-icon');

        this.dom.spriteA = document.getElementById('character-sprite-a');
        this.dom.spriteB = document.getElementById('character-sprite-b');
        this.activeSprite = null;

        this.typewriterInterval = null;

        this.dom.infoPanelBottomGraphic = document.querySelector('.info-panel-bottom-graphic'); 
        
        console.log("UIManager inicializado com sucesso.");
    }
    
    _typewriteText(element, text, speed = 35) {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }

        if (!element) {
            console.error("Elemento para typewrite não encontrado.");
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

    _cleanTutorialHighlights() {
        this.dom.itemMail?.classList.remove('highlight-pulse');
        this.dom.itemBook?.classList.remove('highlight-pulse');
        this.dom.itemWorkbench?.classList.remove('highlight-pulse'); // ATUALIZADO
    }
    
    // <<< NOVA FUNÇÃO GENÉRICA ADICIONADA AQUI >>>
    /**
     * Exibe uma cena de evento narrativo genérica.
     * @param {object} characterData - Os dados do personagem (nome, retrato, diálogo).
     * @param {Function} onContinueCallback - A função a ser executada ao continuar.
     */
    displayNarrativeEvent(characterData, onContinueCallback) {
        if (!characterData) return;

        this.updateCharacterSprite(characterData);
        this.clearActionPanel();
        
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = characterData.name;
        this._typewriteText(this.dom.eventDialogue, `'${characterData.problem}'`);

        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="narrative-continue-btn">Continuar</button>`;
            document.getElementById('narrative-continue-btn')?.addEventListener('click', onContinueCallback, { once: true });
        }
    }

    // <<< FUNÇÃO ADICIONADA PARA CORRIGIR O ERRO >>>
    highlightWorkbenchIcon() {
        this._cleanTutorialHighlights();
        if (this.dom.itemWorkbench) {
            console.log("UI: Aplicando destaque no ícone da Bancada de Trabalho.");
            this.dom.itemWorkbench.classList.add('highlight-pulse');
        } else {
            console.warn("UIManager: Tentativa de destacar o ícone da bancada, mas o elemento 'item-workbench' não foi encontrado.");
        }
    }

    showTutorialStep_LetterPrompt() {
        this.hideCharacterSprite();
        this.clearActionPanel();
        this.hideInfoPanel();
        this._cleanTutorialHighlights();

        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Estúdio Empoeirado";
        this._typewriteText(this.dom.eventDialogue, "Você finalmente chega ao estúdio de seu falecido tio em Port Blackwood. Sobre o balcão, uma única carta selada aguarda.");
        
        if (this.dom.itemMail) this.dom.itemMail.classList.add('highlight-pulse');
    }

    showTutorialStep_JournalPrompt() {
        this.hideCharacterSprite();
        this.clearActionPanel();
        this.hideInfoPanel();
        this._cleanTutorialHighlights();

        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "A Herança de Abner";
        this._typewriteText(this.dom.eventDialogue, "O Professor o instruiu a estudar o grimório. Parece ser a única pista que você tem.");

        if (this.dom.itemBook) this.dom.itemBook.classList.add('highlight-pulse');
    }

    showTutorialStep_ArmitageArrival(onAttendCallback) {
        this.showSilhouetteSprite();
        this.clearActionPanel();
        this.hideInfoPanel();
        this._cleanTutorialHighlights();

        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Uma Visita Inesperada";
        this._typewriteText(this.dom.eventDialogue, "Mal você lê a carta de seu tio, o sino da porta soa, anunciando a chegada de alguém.");

        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="attend-btn-tutorial">Atender</button>`;
            document.getElementById('attend-btn-tutorial')?.addEventListener('click', onAttendCallback, { once: true });
        }
    }

    showTutorialStep_ArmitageDialogue(characterData, onContinueCallback) {
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
        this._cleanTutorialHighlights();

        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Momento de Calma";
        this._typewriteText(this.dom.eventDialogue, "Com o grimório de seu tio em mãos, você agora tem uma noção do que o espera. O silêncio do estúdio é quebrado mais uma vez pelo sino da porta.");

        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="attend-btn-final">Atender</button>`;
            document.getElementById('attend-btn-final')?.addEventListener('click', onAttendCallback, { once: true });
        }
    }
    
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
    
    showSilhouetteSprite() {
        this._setSpriteWithCrossFade('/media/img/background_cliente_sombra.png');
    }

    hideCharacterSprite() {
        if (this.dom.spriteA) this.dom.spriteA.style.opacity = '0';
        if (this.dom.spriteB) this.dom.spriteB.style.opacity = '0';
        this.activeSprite = null;
    }

    showInfoPanel(config) {
        const panel = this.dom.infoPanel;
        const bottomGraphic = this.dom.infoPanelBottomGraphic; 
        if (!panel) return;

        let contentHTML = '';
        if (config.icon) contentHTML += `<img src="${config.icon}" alt="ícone de informação" class="info-panel-icon">`;
        if (config.title) contentHTML += `<h4 class="info-panel-title">${config.title}</h4>`;
        if (config.button) contentHTML += `<button id="${config.button.id}">${config.button.text}</button>`;

        panel.innerHTML = contentHTML;

        const buttonElement = panel.querySelector('button');
        if (buttonElement && config.button.callback) {
            buttonElement.addEventListener('click', () => { this.hideInfoPanel(); config.button.callback(); });
        }
        panel.style.display = 'flex'; 
        if (bottomGraphic) bottomGraphic.classList.add('active');
    }

    hideInfoPanel() {
        if (this.dom.infoPanel) this.dom.infoPanel.style.display = 'none';
        if (this.dom.infoPanel) this.dom.infoPanel.innerHTML = '';
        if (this.dom.infoPanelBottomGraphic) this.dom.infoPanelBottomGraphic.classList.remove('active');
    }
    
    resetClientInterface() {
        const client = this.game.clientManager.getCurrentClient();
        if (!client) {
            console.warn("resetClientInterface chamado sem um cliente válido. Ocultando interface.");
            this.hideCharacterSprite();
            if (this.dom.eventClientName) this.dom.eventClientName.textContent = "";
            if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = "Aguardando cliente...";
            return;
        }
        
        this._cleanTutorialHighlights();
        this.hideInfoPanel(); 
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = client.name;
        this._typewriteText(this.dom.eventDialogue, `'${client.problem}'`);
        this.updateCharacterSprite(client);
    }
    
    showStartDayView(startCallback) {
        this.clearActionPanel();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        this.showSilhouetteSprite();
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Novo Dia";
        this._typewriteText(this.dom.eventDialogue, "As brumas da manhã se dissipam. Você ouve o sino da porta tocar, anunciando a chegada de sua primeira alma atormentada do dia.");
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
    }

    updateActionButtonBasedOnState() {
        if (!this.dom.actionPanel) return;

        const client = this.game.clientManager.getCurrentClient();
        let buttonConfig = null;
        this._cleanTutorialHighlights();

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
        if (this.dom.clientStat) this.dom.clientStat.textContent = `Cliente: ${this.gameState.clientInDay}/${CLIENTS_PER_DAY}`;
        if (this.dom.moneyValue) this.dom.moneyValue.textContent = this.gameState.money;
        if (this.dom.sanityProgressBar) {
            const sanityPercent = (this.gameState.sanity / 100) * 100;
            this.dom.sanityProgressBar.style.width = `${Math.max(0, sanityPercent)}%`;
        }
        if (this.dom.inkValue) this.dom.inkValue.textContent = this.gameState.inkCharges;
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
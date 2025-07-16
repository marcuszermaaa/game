// js/managers/UIManager.js

import { CLIENTS_PER_DAY } from '../constants.js';

export class UIManager {
    constructor(domRefs, gameState, gameInstance) {
        this.dom = domRefs;
        this.gameState = gameState;
        this.game = gameInstance;
        
        this.dom.upgradeLupaIcon = document.getElementById('upgrade-lupa-icon');
        this.dom.upgradeLampIcon = document.getElementById('upgrade-lamp-icon');
        this.dom.upgradeBraceIcon = document.getElementById('upgrade-brace-icon');

        console.log("UIManager inicializado com sucesso.");
    }

    _setSpriteWithFade(imageUrl) {
        const sprite = this.dom.characterSprite;
        if (!sprite) return; 
        sprite.style.opacity = '0';
        sprite.style.transition = 'opacity 0.75s ease-in-out';
        sprite.style.backgroundImage = `url('${imageUrl}')`;
        sprite.style.display = 'block';
        setTimeout(() => { sprite.style.opacity = '1'; }, 10);
    }
    
    updateCoreUIElements(hasUnreadMail) {
        // Lógica para o ícone da Lupa
        if (this.dom.upgradeLupaIcon) {
            this.dom.upgradeLupaIcon.classList.toggle('active', this.gameState.purchasedUpgrades.has('lupa_analise'));
        }

        // Lógica para o ícone da Lâmpada
        if (this.dom.upgradeLampIcon) {
            this.dom.upgradeLampIcon.classList.toggle('active', this.gameState.purchasedUpgrades.has('lamp'));
        }

        // Lógica para o ícone da Munhequeira
        if (this.dom.upgradeBraceIcon) {
            this.dom.upgradeBraceIcon.classList.toggle('active', this.gameState.purchasedUpgrades.has('brace'));
        }

        // Lógica para a notificação de e-mail
        if (this.dom.itemMail) {
            this.dom.itemMail.classList.toggle('highlight-pulse', hasUnreadMail);
        }
    }

    // ... (O resto do arquivo UIManager.js permanece exatamente o mesmo, sem necessidade de alterações)
    // Cole o restante do seu código UIManager aqui (updateCharacterSprite, showStartDayView, etc.)
    updateCharacterSprite(client) {
        const shouldShow = client?.portraitUrls?.length > 0;
        if (shouldShow) {
            this._setSpriteWithFade(client.portraitUrls[0]);
        } else {
            this.hideCharacterSprite();
        }
    }
    
    showSilhouetteSprite() {
        const silhouetteImageUrl = '/media/img/background_cliente_sombra.png';
        this._setSpriteWithFade(silhouetteImageUrl);
    }

    hideCharacterSprite() {
        const sprite = this.dom.characterSprite;
        if (sprite) {
            sprite.style.opacity = '0';
            setTimeout(() => {
                 sprite.style.display = 'none';
            }, 750);
        }
    }
    
    resetClientInterface() {
        const client = this.game.clientManager.getCurrentClient();
        if (!client) return;
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = client.name;
        if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = `'${client.problem}'`;
        this.updateCharacterSprite(client);
    }

    setupTutorialUI(tutorialStep) {
        this.clearActionPanel();
        this.hideCharacterSprite();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        this.dom.itemMail?.classList.remove('highlight-pulse');
        this.dom.itemBook?.classList.remove('highlight-pulse');

        if (tutorialStep === 'initial_mail') {
            if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Novo Começo";
            if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = "Você encontrou uma carta endereçada a você na soleira da porta. Parece importante.";
            this.dom.itemMail?.classList.add('highlight-pulse');
        } 
        else if (tutorialStep === 'read_mail_then_diary') {
            if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = "A carta é de seu falecido tio, Abner. Ele lhe deixou o estúdio e... seu diário. Ele insiste que você o leia.";
            this.dom.itemBook?.classList.add('highlight-pulse');
        }
    }

    showStartDayView(startCallback) {
        this.clearActionPanel();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        
        this.showSilhouetteSprite();

        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Novo Dia";
        if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = "As brumas da manhã se dissipam. Você ouve o sino da porta tocar, anunciando a chegada de sua primeira alma atormentada do dia.";

        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="attend-client-btn">Atender Cliente</button>`;
            document.getElementById('attend-client-btn')?.addEventListener('click', startCallback);
        }
    }

    showOutcomeView(title, text, nextActionCallback) {
        this.hideCharacterSprite();
        this.clearActionPanel();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = title;
        if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = text;
        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="next-action-btn">Próximo</button>`;
            document.getElementById('next-action-btn')?.addEventListener('click', nextActionCallback);
        }
    }

    updateActionButtonBasedOnState() {
        if (!this.dom.actionPanel) return;
        const client = this.game.clientManager.getCurrentClient();
        let buttonConfig = null;
        this.dom.itemBook?.classList.remove('highlight-pulse');

        if (!client) {
            buttonConfig = null;
        } else if (this.gameState.playerSigilChoice) {
            buttonConfig = { id: 'start-tattoo-btn', text: 'Iniciar Tatuagem', onClick: () => this.game.startMinigame() };
        } else if (client.request) {
            buttonConfig = { id: 'analyze-request-btn', text: 'Analisar o Pedido', onClick: () => this.game.startAnalysis() };
        } else {
            buttonConfig = null;
            this.dom.itemBook?.classList.add('highlight-pulse');
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
    }
    
    clearActionPanel() {
        if (this.dom.actionPanel) this.dom.actionPanel.innerHTML = '';
    }

    showEndGameView(reason, restartCallback) {
        this.hideCharacterSprite();
        this.clearActionPanel();
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
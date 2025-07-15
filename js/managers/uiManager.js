// js/managers/UIManager.js
// Este gerente é o "Diretor de Arte" do seu jogo. Sua única responsabilidade
// é manipular o DOM (os elementos HTML da página) para refletir o estado atual do jogo.
// Ele recebe ordens do GameManager e as traduz em mudanças visuais, como mostrar
// textos, criar botões, aplicar efeitos e animações.

import { CLIENTS_PER_DAY } from '../constants.js';

export class UIManager {
    /**
     * Construtor do UIManager.
     * @param {object} domRefs - Uma coleção de referências para os elementos DOM, pré-selecionados pelo GameManager.
     * @param {object} gameState - A referência viva ao estado atual do jogo.
     * @param {object} gameInstance - A instância principal do GameManager, usada para que os botões criados aqui possam chamar funções do jogo.
     */
    constructor(domRefs, gameState, gameInstance) {
        this.dom = domRefs;
        this.gameState = gameState;
        this.game = gameInstance;
        console.log("UIManager inicializado com sucesso.");
    }

    // ===================================================================
    // --- FUNÇÃO PRIVADA CENTRAL PARA EFEITOS DE SPRITE ---
    // ===================================================================

    /**
     * Define a imagem do sprite do personagem e aplica um efeito de FADE-IN.
     * Esta é a função "mestre" para qualquer mudança no sprite. Usar um método
     * privado (convenção com '_') garante que a lógica do fade seja consistente.
     * @param {string} imageUrl - O caminho para a imagem a ser exibida.
     * @private
     */
    _setSpriteWithFade(imageUrl) {
        const sprite = this.dom.characterSprite;
        if (!sprite) return; // Segurança: não faz nada se o elemento não existir.

        // 1. Inicia a animação deixando o sprite transparente.
        sprite.style.opacity = '0';
        
        // 2. Garante que a transição de CSS esteja definida. Pode ser feito no CSS, mas aqui garante o comportamento.
        sprite.style.transition = 'opacity 0.75s ease-in-out';
        
        // 3. Define a nova imagem de fundo.
        sprite.style.backgroundImage = `url('${imageUrl}')`;
        
        // 4. Garante que o elemento esteja visível na tela.
        sprite.style.display = 'block';
        
        // 5. Usa um pequeno timeout para permitir que o navegador processe as mudanças
        //    (opacity: 0, display: block) antes de iniciar o fade para 1. Isso força a transição a ocorrer.
        setTimeout(() => {
            sprite.style.opacity = '1';
        }, 10);
    }

    // ===================================================================
    // --- MÉTODOS PÚBLICOS QUE USAM O FADE ---
    // ===================================================================

    /**
     * Define o sprite de um personagem REAL.
     * Ele apenas prepara a URL e chama a função mestre do fade.
     */
    updateCharacterSprite(client) {
        const shouldShow = client?.portraitUrls?.length > 0;
        if (shouldShow) {
            this._setSpriteWithFade(client.portraitUrls[0]);
        } else {
            this.hideCharacterSprite();
        }
    }
    
    /**
     * Mostra uma silhueta genérica de cliente chegando.
     * Também utiliza a função mestre do fade para consistência.
     */
    showSilhouetteSprite() {
        const silhouetteImageUrl = '/media/img/background_cliente_sombra.png';
        this._setSpriteWithFade(silhouetteImageUrl);
    }

    /**
     * Esconde o painel do personagem completamente.
     */
    hideCharacterSprite() {
        const sprite = this.dom.characterSprite;
        if (sprite) {
            sprite.style.opacity = '0';
            sprite.style.display = 'none';
        }
    }

    // ===================================================================
    // --- MÉTODOS DE CONFIGURAÇÃO DE CENAS E UI ---
    // ===================================================================
    
    /**
     * Prepara a interface para um cliente ativo.
     */
    resetClientInterface() {
        const client = this.game.clientManager.getCurrentClient();
        if (!client) return;
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        if (this.dom.eventClientName) this.dom.eventClientName.textContent = client.name;
        if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = `'${client.problem}'`;
        this.updateCharacterSprite(client); // Usa a função que já tem o fade.
    }

    /**
     * Configura a UI para os passos do tutorial.
     */
    setupTutorialUI(tutorialStep) {
        this.clearActionPanel();
        this.hideCharacterSprite(); // CRÍTICO: Garante que o painel esteja vazio durante o tutorial.
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

    /**
     * Configura a UI para a tela de transição de "início de dia".
     */
    showStartDayView(startCallback) {
        this.clearActionPanel();
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        
        this.showSilhouetteSprite(); // Usa a função que já tem o fade.

        if (this.dom.eventClientName) this.dom.eventClientName.textContent = "Um Novo Dia";
        if (this.dom.eventDialogue) this.dom.eventDialogue.textContent = "As brumas da manhã se dissipam. Você ouve o sino da porta tocar, anunciando a chegada de sua primeira alma atormentada do dia.";

        if (this.dom.actionPanel) {
            this.dom.actionPanel.innerHTML = `<button id="attend-client-btn">Atender Cliente</button>`;
            document.getElementById('attend-client-btn')?.addEventListener('click', startCallback);
        }
    }

    /**
     * Mostra a tela de resultado após uma ação.
     */
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

    /**
     * Lógica central para decidir o que exibir no painel de ação.
     */
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

    /**
     * Atualiza todas as estatísticas visíveis na tela.
     */
    updateStats() {
        if (this.dom.dayStat) this.dom.dayStat.textContent = `Dia: ${this.gameState.day}`;
        if (this.dom.clientStat) this.dom.clientStat.textContent = `Cliente: ${this.gameState.clientInDay}/${CLIENTS_PER_DAY}`;
        if (this.dom.moneyValue) this.dom.moneyValue.textContent = this.gameState.money;
        if (this.dom.sanityProgressBar) {
            const sanityPercent = (this.gameState.sanity / 100) * 100;
            this.dom.sanityProgressBar.style.width = `${Math.max(0, sanityPercent)}%`;
        }
    }
    
    /** Limpa o painel de ação. */
    clearActionPanel() {
        if (this.dom.actionPanel) this.dom.actionPanel.innerHTML = '';
    }

    /** Mostra a tela de fim de jogo. */
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

    /** Mostra o painel de diálogo. */
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

    /** Lida com o fim de um diálogo. */
    handleDialogueEnd() {
        if (this.dom.dialogueInteractionPanel) this.dom.dialogueInteractionPanel.style.display = 'none';
        this.resetClientInterface();
        this.updateActionButtonBasedOnState();
    }
}
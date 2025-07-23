// js/managers/TutorialManager.js

export class TutorialManager {
    constructor(gameManager, uiManager, gameState) {
        this.game = gameManager;
        this.ui = uiManager;
        this.state = gameState;
        this.currentStep = this.state.tutorialStep || 'initial_mail';
    }

    // Inicia ou continua o tutorial
    update() {
        // Limpa a UI para o estado de tutorial
        this.ui.clearActionPanel();
        this.ui.hideCharacterSprite();
        this.ui.hideInfoPanel(); 
        this.ui.dom.dialogueInteractionPanel.style.display = 'none';
        this.ui.dom.itemMail?.classList.remove('highlight-pulse');
        this.ui.dom.itemBook?.classList.remove('highlight-pulse');

        // Lida com cada passo específico
        this.handleStep(this.currentStep);
    }
    
    handleStep(step) {
        switch(step) {
            case 'initial_mail':
                this.ui.dom.eventClientName.textContent = "Um Novo Começo";
                const textMail = "Você encontrou uma carta endereçada a você na soleira da porta. Parece importante.";
                this.ui._typewriteText(this.ui.dom.eventDialogue, textMail); // Usando a função interna do UIManager
                this.ui.dom.itemMail?.classList.add('highlight-pulse');
                // A lógica de clique no ícone de email irá avançar o estado
                break;

            case 'read_mail_then_diary':
                this.ui.dom.eventClientName.textContent = "Um Novo Começo";
                const textDiary = "A carta é de seu falecido tio, Abner. Ele lhe deixou o estúdio e... seu diário. Ele insiste que você o leia.";
                this.ui._typewriteText(this.ui.dom.eventDialogue, textDiary);
                this.ui.dom.itemBook?.classList.add('highlight-pulse');
                // O clique no livro agora sinalizará o fim do tutorial
                break;
        }
    }

    // Avança para o próximo passo (chamado por eventos externos, como ler um email)
    advanceStep(nextStep) {
        this.currentStep = nextStep;
        this.state.tutorialStep = nextStep; // Atualiza o estado global
        this.update(); // Re-renderiza a UI para o novo passo
    }

    // Sinaliza que o tutorial foi completamente finalizado
    completeTutorial() {
        console.log("TUTORIAL CONCLUÍDO! Entregando controle de volta ao GameManager.");
        this.state.showingTutorial = false; // A flag principal que o GameManager verifica
        delete this.state.tutorialStep; // Limpa o estado desnecessário
        
        this.game.saveGameState();
        // Chama uma função no GameManager para iniciar a sequência de fim de dia/início do jogo
        this.game.startEndDaySequence(); 
    }
}
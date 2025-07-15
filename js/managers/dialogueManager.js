// js/managers/dialogueManager.js - Gerencia a lógica de exibição e progressão dos diálogos com os clientes.

// --- IMPORTS ---
import { DIALOGUES } from '../data/dialogueData.js';
import { SIGILS } from '../data/sigilData.js';

/**
 * Classe responsável por gerenciar o fluxo de diálogos durante as interações com clientes.
 */
export class DialogueManager {
    /**
     * Construtor do DialogueManager.
     * @param {object} gameState - Referência ao estado atual do jogo.
     * @param {object} gameInstance - A instância principal do GameManager para chamar suas funções.
     */
    constructor(gameState, gameInstance) {
        this.dialogues = DIALOGUES;
        this.sigils = SIGILS;
        this.gameState = gameState;
        this.game = gameInstance; // <<< MUDANÇA: Armazena a referência ao GameManager.
        console.log("DialogueManager inicializado.");
    }

    /**
     * Obtém a configuração completa de diálogos para um cliente específico.
     * @param {string} clientId O ID do cliente.
     * @returns {object|null} O objeto de diálogos do cliente ou null se não encontrado.
     */
    getDialoguesForClient(clientId) {
        return this.dialogues[clientId];
    }

    /**
     * Obtém os dados de um nó de diálogo específico para um cliente.
     * @param {string} clientId O ID do cliente.
     * @param {string} nodeId O ID do nó de diálogo (ex: 'dialogue_1a', 'dialogue_final').
     * @returns {object|null} Os dados do nó de diálogo ou null se não encontrado.
     */
    getDialogueNode(clientId, nodeId) {
        const clientDialogues = this.getDialoguesForClient(clientId);
        if (clientDialogues && nodeId && clientDialogues[nodeId]) {
            return clientDialogues[nodeId];
        }
        console.warn(`Nó de diálogo '${nodeId}' não encontrado para o cliente ${clientId}.`);
        return null;
    }

    /**
     * Processa uma ação específica associada a uma opção de diálogo
     * E APLICA a mudança de sanidade resultante diretamente no jogo.
     * @param {string} action A string da ação a ser processada (ex: 'correct', 'accept_corrupted').
     */
    processDialogueAction(action) {
        let sanityChange = 0;
        console.log(`DialogueManager: Processando ação '${action}'`);
        
        switch(action) {
            case 'correct': sanityChange = 5; break;
            case 'accept_corrupted': sanityChange = -20; break;
            case 'refuse': sanityChange = 10; break;
            case 'accept_prohibited': sanityChange = -50; break;
            case 'accept_normal': sanityChange = 0; break;
            default: console.warn(`Ação de diálogo desconhecida: '${action}'`);
        }

        // <<< MUDANÇA CRÍTICA: Aplica a mudança de sanidade diretamente. >>>
        // Se a mudança não for zero, chama a função do GameManager para aplicá-la.
        if (sanityChange !== 0) {
            this.game.changeSanity(sanityChange);
        }
        
        // A função não precisa mais retornar um valor, pois ela mesma já agiu.
    }

    // As funções abaixo não precisam de alteração.
    
    isLastNode(currentNode) {
        if (!currentNode || !currentNode.options) return true;
        return currentNode.options.every(option => option.nextNode === null || option.nextNode === undefined);
    }

    startDialogueFor(clientId) {
        const clientDialogues = this.getDialoguesForClient(clientId);
        if (clientDialogues && clientDialogues.initial) {
            this.gameState.currentDialogueNode = `${clientId}_initial`;
            return clientDialogues.initial;
        }
        return null;
    }
}
// js/managers/MinigameManager.js

import { CLIENTS } from '../data/clientData.js';
import { SIGILS } from '../data/sigilData.js';

/**
 * Gerencia a lógica de diferentes tipos de minigames.
 * Responsável por iniciar, exibir e processar resultados de minigames.
 */
export class MinigameManager {
    constructor(gameState, gameManager) {
        this.gameState = gameState;
        this.gameManager = gameManager;
        this.currentClient = null;
        this.currentMinigameType = null;
        this.currentMinigameData = null;
        console.log("MinigameManager inicializado.");
    }

    /**
     * Inicia um minigame com base no tipo e nos dados fornecidos.
     * @param {object} client - O objeto do cliente atual.
     * @param {string} type - O tipo de minigame ('creation', 'evaluation', etc.).
     * @param {object} data - Os dados específicos para este tipo de minigame.
     */
    startMinigame(client, type, data) {
        console.log(`MinigameManager: Iniciando minigame do tipo '${type}' para ${client.name}.`);
        this.currentClient = client;
        this.currentMinigameType = type;
        this.currentMinigameData = data;

        switch (type) {
            case 'creation':
                this._startCreationMinigame(data);
                break;
            case 'evaluation':
                this._startEvaluationMinigame(data);
                break;
            default:
                console.error(`MinigameManager: Tipo de minigame desconhecido: ${type}`);
                // Fallback: se o tipo for desconhecido, talvez voltar para o jogo.
                this.gameManager.advanceToNextClient(); 
                break;
        }
    }

    /**
     * Inicia a lógica e a UI para o minigame de Criação.
     * @param {object} creationData - Dados específicos de criação.
     */
    _startCreationMinigame(creationData) {
        console.log("MinigameManager: Preparando para exibir minigame de Criação.");
        // Aqui, idealmente, você carregaríamos a UI e a lógica de desenho.
        // Para manter a abordagem de página única, redirecionamos.
        this.redirectToMinigamePage('creation');
    }

    /**
     * Inicia a lógica e a UI para o minigame de Avaliação.
     * @param {object} evaluationData - Dados específicos de avaliação.
     */
    _startEvaluationMinigame(evaluationData) {
        console.log("MinigameManager: Preparando para exibir minigame de Avaliação.");
        this.redirectToMinigamePage('evaluation');
    }

    /**
     * Redireciona para a página de minigame, passando os parâmetros necessários.
     * @param {string} type - O tipo de minigame.
     */
    redirectToMinigamePage(type) {
        console.log(`MinigameManager: Redirecionando para /minigame.html?type=${type}&client=${this.currentClient.id}`);
        // Salva o estado ANTES de redirecionar, para que a página de minigame possa carregá-lo.
        this.gameManager.saveGameState(); 
        
        // Redireciona para a página de minigame.
        window.location.href = `/minigame.html?type=${type}&client=${this.currentClient.id}`;
    }

    /**
     * Processa o resultado enviado de volta pela página de minigame.
     * @param {object} resultData - Os dados do resultado do minigame (ex: { outcomeKey: 'success', title: '...', outcome: {...} }).
     */
    processMinigameResult(resultData) {
        console.log("MinigameManager: Resultado recebido:", resultData);
        // Envia o resultado para o GameManager processar.
        this.gameManager.processMinigameOutcome(resultData);
    }
}
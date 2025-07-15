// js/managers/ClientManager.js - Gerencia a lógica relacionada aos clientes do jogo.

// --- IMPORTS ---
// O caminho do import é a parte mais crítica a ser verificada.
// Ele assume que a pasta 'js' e a pasta 'data' estão no mesmo nível (na raiz do projeto).
import { CLIENTS } from '../data/clientData.js';

/**
 * Classe responsável por gerenciar a "agenda" dos clientes.
 */
export class ClientManager {
    /**
     * Construtor do ClientManager.
     * @param {object} gameState - A referência ao estado atual do jogo.
     */
    constructor(gameState) {
        // <<< LINHA DE DEPURAÇÃO ADICIONADA >>>
        // Esta linha é crucial. Ela nos mostrará no console do navegador o que
        // foi realmente carregado para a variável CLIENTS.
        console.log("DEBUG: Conteúdo de CLIENTS importado:", CLIENTS);

        // Validação de segurança para garantir que os dados foram carregados corretamente.
        // Se o import falhar, esta verificação lançará um erro claro no console.
        if (!CLIENTS || !Array.isArray(CLIENTS)) {
            throw new Error("Erro crítico: Os dados dos clientes (CLIENTS) não foram carregados ou são inválidos. Verifique o caminho do import em clientManager.js e a estrutura do arquivo clientData.js.");
        }
        
        this.clients = CLIENTS;
        this.gameState = gameState;
        
        console.log(`ClientManager operando para o Dia ${this.gameState.day}.`);
    }

    /**
     * Filtra a lista completa de clientes para retornar apenas aqueles do dia especificado.
     * @param {number} day - O dia do jogo para o qual obter os clientes.
     * @returns {Array} Uma lista de objetos de clientes agendados para aquele dia.
     */
    getClientsForDay(day) {
        return this.clients.filter(c => c.day === day);
    }
    
    /**
     * Verifica se existe algum cliente agendado para um determinado dia.
     * @param {number} day - O dia a ser verificado.
     * @returns {boolean} True se houver pelo menos um cliente para o dia, false caso contrário.
     */
    hasClientsForDay(day) {
        return this.getClientsForDay(day).length > 0;
    }

    /**
     * Obtém o objeto do cliente atual com base no dia e no contador de cliente do dia.
     * @returns {object|null} O objeto do cliente atual, ou null se não houver um.
     */
    getCurrentClient() {
        const clientsForToday = this.getClientsForDay(this.gameState.day);
        if (!clientsForToday.length) return null;

        const clientIndex = this.gameState.clientInDay - 1;
        if (clientIndex < 0 || clientIndex >= clientsForToday.length) return null;

        return clientsForToday[clientIndex];
    }

    /**
     * Verifica as condições de exibição para um cliente.
     * @param {object} client - O objeto de dados do cliente a ser verificado.
     * @returns {boolean} True se o cliente deve ser exibido, false caso contrário.
     */
    shouldDisplayClient(client) {
        if (!client) return false;

        if (client.appearanceCondition?.sanityBelow !== undefined) {
            if (this.gameState.sanity >= client.appearanceCondition.sanityBelow) return false;
        }
        if (client.requiresUpgrade && !this.gameState.purchasedUpgrades.has(client.requiresUpgrade)) {
            return false;
        }
        return true;
    }
}
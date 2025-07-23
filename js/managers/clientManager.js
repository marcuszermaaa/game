// js/managers/ClientManager.js - VERSÃO COMPLETA E CORRIGIDA

import { CLIENTS } from '../data/clientData.js';

export class ClientManager {
    constructor(gameState) {
        if (!CLIENTS || !Array.isArray(CLIENTS)) {
            throw new Error("Erro crítico: Os dados dos clientes (CLIENTS) não foram carregados.");
        }
        
        this.clients = CLIENTS;
        this.gameState = gameState;
    }

    getClientsForDay(day) {
        return this.clients.filter(c => c.day === day);
    }
    
    hasClientsForDay(day) {
        return this.getClientsForDay(day).length > 0;
    }

    getCurrentClient() {
        const clientsForToday = this.getClientsForDay(this.gameState.day);
        if (!clientsForToday.length) return null;

        const clientIndex = this.gameState.clientInDay - 1;
        if (clientIndex < 0 || clientIndex >= clientsForToday.length) return null;

        return clientsForToday[clientIndex];
    }
    
    getClientByIndex(index) {
        const clientsForToday = this.getClientsForDay(this.gameState.day);
        if (index >= 0 && index < clientsForToday.length) {
            return clientsForToday[index];
        }
        console.warn(`Nenhum cliente encontrado no índice ${index} para o dia ${this.gameState.day}.`);
        return null;
    }

    shouldDisplayClient(client) {
        if (!client) return false;

        if (client.appearanceCondition?.sanityBelow !== undefined) {
            if (this.gameState.sanity >= client.appearanceCondition.sanityBelow) {
                return false;
            }
        }

        if (client.requiresUpgrade && !this.gameState.purchasedUpgrades.has(client.requiresUpgrade)) {
            return false;
        }

        if (client.requiresUnlock) {
            if (!this.gameState.unlockedClients || !this.gameState.unlockedClients.includes(client.id)) {
                return false; 
            }
        }

        return true;
    }
}
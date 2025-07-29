// js/managers/ClientManager.js - VERSÃO COMPLETA E CORRIGIDA
// Importe os novos dados no topo do arquivo
import { CLIENTS, CONDITIONAL_CLIENTS } from '../data/clientData.js';

export class ClientManager {
    constructor(gameState) {
        // ...
        this.clients = CLIENTS;
        this.conditionalClients = CONDITIONAL_CLIENTS; // Armazena os clientes condicionais
        this.gameState = gameState;
    }

getClientsForDay(day) {
        // 1. Pega os clientes normais para o dia
        let clientsForToday = this.clients.filter(c => c.day === day);

        // 2. Verifica se algum cliente condicional deve aparecer
        const history = this.gameState.clientHistory || [];
        
        this.conditionalClients.forEach(condClient => {
            // Verifica se o cliente já apareceu neste evento
            const hasAlreadyAppeared = history.some(h => h.clientId === condClient.id);

            if (!hasAlreadyAppeared && day >= condClient.trigger.minDay) {
                // Procura no histórico o evento que dispara este cliente
                const triggerEvent = history.find(h => 
                    h.clientId === condClient.trigger.clientId &&
                    (h.method === condClient.trigger.method || h.outcome === condClient.trigger.outcome)
                );

                if (triggerEvent) {
                    // Gatilho encontrado! Adiciona o cliente à lista do dia.
                    // Ajustamos o dia do cliente para o dia atual para que ele apareça corretamente
                    const clientToAdd = { ...condClient, day: day };
                    clientsForToday.push(clientToAdd);
                }
            }
        });
        
        // Ordena os clientes por segurança, caso a ordem importe
        return clientsForToday.sort((a, b) => (a.order || 0) - (b.order || 0));
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
// js/journal.js - RESPONSABILIDADE: APENAS INICIALIZAÇÃO
// Ponto de entrada para a página do diário.

// Importa o gerente principal.
import { JournalManager } from './managers/journalManager.js';

// Assim que o HTML estiver pronto, cria a instância do JournalManager,
// que por sua vez cuidará de todo o resto.
document.addEventListener('DOMContentLoaded', () => {
    new JournalManager();
});
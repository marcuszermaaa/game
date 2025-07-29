// js/journal.js - PONTO DE ENTRADA (NÃO MUDA)

import { JournalManager } from './managers/journalManager.js';

document.addEventListener('DOMContentLoaded', () => {
    new JournalManager();
});
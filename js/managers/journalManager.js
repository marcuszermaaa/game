// js/managers/journalManager.js - VERSÃO COMPLETA E CORRIGIDA

import { BESTIARY } from '../data/bestiaryData.js'; 
import { SIGILS } from '../data/sigilData.js';
import { CLIENTS } from '../data/clientData.js';
import { UPGRADES } from '../data/upgradeData.js';
import { MAILS } from '../data/mailData.js';
import { ELEMENTOS } from '../data/workbenchData.js';
import { JournalUIManager, generateSigilDrawing } from './journalUIManager.js';

export class JournalManager {
    constructor() {
        this.dom = {
            journalBook: document.getElementById('journal-book'),
            grimorioTabs: document.querySelector('.grimorio-tabs'),
            dynamicContentArea: document.getElementById('dynamic-content-area'),
            prevContentBtn: document.getElementById('prev-content-btn'),
            nextContentBtn: document.getElementById('next-content-btn'),
            selectSigilBtn: document.getElementById('select-sigil-btn'),
            backToGameBtn: document.getElementById('back-to-game-btn'),
            journalSanityValue: document.getElementById('journal-sanity-value')
        };
        
        this.ui = new JournalUIManager(this.dom);
        
        this.gameState = {};
        this.currentTab = 'simbolos';
        this.currentPageIndex = 0;
        this.itemsPerPage = 4;
        this.allSigilsArray = Object.values(SIGILS);

        this.init();
    }

    init() {
        this.loadGameState();
        this.ui.updateStatusDisplays(this.gameState);
        this.bindEvents();
        this.renderCurrentTab();
        this.ui.applyTutorialHighlights(this.gameState.tutorialStep);
        this.applyInitialSelection();
    }

    loadGameState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                this.gameState = JSON.parse(savedState);
                
                this.gameState.purchasedUpgrades = new Set(Array.isArray(this.gameState.purchasedUpgrades) ? this.gameState.purchasedUpgrades : []);
                this.gameState.readMailIds = new Set(Array.isArray(this.gameState.readMailIds) ? this.gameState.readMailIds : []);
                this.gameState.clientHistory = Array.isArray(this.gameState.clientHistory) ? this.gameState.clientHistory : [];
                this.gameState.discoveredSigils = new Set(Array.isArray(this.gameState.discoveredSigils) ? this.gameState.discoveredSigils : Object.keys(SIGILS));
                this.gameState.discoveredBeasts = new Set(Array.isArray(this.gameState.discoveredBeasts) ? this.gameState.discoveredBeasts : []);
                this.gameState.craftingIngredients = new Set(Array.isArray(this.gameState.craftingIngredients) ? this.gameState.craftingIngredients : []);

                if (this.gameState.discoveredBeasts.size === 0 && BESTIARY['deep_one']) {
                    this.gameState.discoveredBeasts.add('deep_one');
                }

            } catch (e) {
                console.error("JournalManager: Erro ao carregar gameState. Redirecionando.", e);
                localStorage.removeItem('gameState');
                window.location.href = '/index.html';
            }
        } else {
            console.error("JournalManager: Nenhum estado de jogo encontrado. Voltando ao menu.");
            window.location.href = '/index.html';
        }
    }
    
    _saveGameState() {
        const stateToSave = { ...this.gameState };
        stateToSave.purchasedUpgrades = Array.from(this.gameState.purchasedUpgrades || []);
        stateToSave.readMailIds = Array.from(this.gameState.readMailIds || []);
        stateToSave.discoveredSigils = Array.from(this.gameState.discoveredSigils || []);
        stateToSave.discoveredBeasts = Array.from(this.gameState.discoveredBeasts || []);
        stateToSave.craftingIngredients = Array.from(this.gameState.craftingIngredients || []);
        localStorage.setItem('gameState', JSON.stringify(stateToSave));
        console.log("JournalManager: Estado do jogo salvo com segurança.");
    }
    
    bindEvents() {
        this.dom.grimorioTabs.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.handleTabClick(e.target.dataset.tab));
        });
        this.dom.prevContentBtn?.addEventListener('click', () => this.navigateContent(-1));
        this.dom.nextContentBtn?.addEventListener('click', () => this.navigateContent(1));
        this.dom.selectSigilBtn?.addEventListener('click', () => {
            const selectedSigilId = this.dom.selectSigilBtn.dataset.selectedSigil;
            if (selectedSigilId) {
                this.selectSigil(selectedSigilId);
            }
        });
        this.dom.backToGameBtn?.addEventListener('click', () => this.goBackToGame());
    }

    handleTabClick(tabName) {
        if (!tabName || this.currentTab === tabName) return;

        if (this.gameState.tutorialStep === 'journal_prompt' && tabName === 'simbolos') {
            this.gameState.tutorialStep = 'select_first_sigil';
            this.ui.applyTutorialHighlights(this.gameState.tutorialStep);
        }

        this.ui.dom.grimorioTabs.querySelector(`.tab-button.active`)?.classList.remove('active');
        this.ui.dom.grimorioTabs.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        this.currentTab = tabName;
        this.currentPageIndex = 0;
        this.renderCurrentTab();
    }
    
    // <<< CORREÇÃO PRINCIPAL AQUI >>>
    selectSigil(sigilId) {
        this.gameState.playerSigilChoice = sigilId;

        // Se estivermos em qualquer etapa do tutorial do grimório...
        if (this.gameState.tutorialStep === 'journal_prompt' || this.gameState.tutorialStep === 'select_first_sigil') {
            // ... avançamos para a etapa final de espera.
            this.gameState.tutorialStep = 'final_wait';
        }

        // Esta função agora chama goBackToGame para centralizar a lógica de salvamento e redirecionamento.
        this.goBackToGame();
    }

    goBackToGame() {
        // Se o jogador clicar em "Voltar" sem selecionar, também avança para a espera.
        if (this.gameState.tutorialStep === 'journal_prompt' || this.gameState.tutorialStep === 'select_first_sigil') {
            this.gameState.tutorialStep = 'final_wait';
        }
        
        this._saveGameState();
        window.location.href = '/game.html';
    }

    renderCurrentTab() {
        this.ui.clearContentArea();
        this.ui.updateNavigationButtons(0, 0);
        this.ui.hideSelectSigilButton();
        switch (this.currentTab) {
            case 'simbolos': this.renderSimbolosTab(); break;
            case 'bestiario': this.renderBestiarioTab(); break;
            case 'cronicas': this.renderCronicasTab(); break;
            case 'artefatos': this.renderArtefatosTab(); break;
            case 'anotacoes': this.renderAnotacoesTab(); break;
            default: this.dom.dynamicContentArea.innerHTML = '<p>Conteúdo não encontrado.</p>';
        }
    }

    renderSimbolosTab() {
        const discoveredSigilsArray = this.allSigilsArray.filter(sigil => this.gameState.discoveredSigils.has(sigil.id));
        const totalPages = Math.ceil(discoveredSigilsArray.length / this.itemsPerPage);
        const startIndex = this.currentPageIndex * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentSigilsToDisplay = discoveredSigilsArray.slice(startIndex, endIndex);

        let contentHtml = '<div class="sigil-grid">';
        if (currentSigilsToDisplay.length > 0) {
            currentSigilsToDisplay.forEach(sigil => {
                contentHtml += `
                    <div class="sigil-card type-${sigil.type}" data-sigil-id="${sigil.id}">
                        <h3 class="sigil-name">${sigil.name}</h3>
                        <div class="sigil-drawing-area">${generateSigilDrawing(sigil.nodes)}</div>
                        <p class="sigil-lore">${sigil.lore}</p>
                        <span class="sigil-type-indicator">${sigil.type.toUpperCase()}</span>
                    </div>
                `;
            });
        } else {
            contentHtml += '<p class="placeholder-text">Nenhum símbolo arcano descoberto ainda.</p>';
        }
        contentHtml += `</div>`;
        
        this.dom.dynamicContentArea.innerHTML = contentHtml;
        this.ui.updateNavigationButtons(this.currentPageIndex, totalPages);

        this.dom.dynamicContentArea.querySelectorAll('.sigil-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleSigilCardClick(e));
        });
    }

    handleSigilCardClick(event) {
        const card = event.currentTarget;
        const sigilId = card.dataset.sigilId;
        this.dom.dynamicContentArea.querySelectorAll('.sigil-card.selected').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.ui.showSelectSigilButton(sigilId);
    }
    
    applyInitialSelection() {
        if (this.currentTab === 'simbolos' && this.gameState.playerSigilChoice) {
            const card = this.dom.dynamicContentArea.querySelector(`.sigil-card[data-sigil-id="${this.gameState.playerSigilChoice}"]`);
            if (card) {
                card.classList.add('selected');
                this.ui.showSelectSigilButton(this.gameState.playerSigilChoice);
            }
        }
    }

    renderBestiarioTab() {
        let contentHtml = '<div class="bestiary-grid">';
        const discoveredBeasts = this.gameState.discoveredBeasts;
        if (discoveredBeasts.size > 0) {
            discoveredBeasts.forEach(beastId => {
                const beast = BESTIARY[beastId];
                if (beast) {
                    contentHtml += `
                        <div class="bestiary-card">
                            <img src="${beast.imageUrl || ''}" alt="${beast.name}" class="bestiary-image">
                            <div class="bestiary-info">
                                <h3 class="bestiary-name">${beast.name}</h3>
                                <p class="bestiary-description">${beast.description}</p>
                            </div>
                        </div>
                    `;
                }
            });
        } else {
            contentHtml += '<p class="placeholder-text">Nenhuma criatura das sombras foi catalogada ainda.</p>';
        }
        contentHtml += `</div>`;
        this.dom.dynamicContentArea.innerHTML = contentHtml;
    }

    renderCronicasTab() {
        let contentHtml = '<div class="chronicles-list">';
        const clientHistory = this.gameState.clientHistory || [];

        if (clientHistory.length > 0) {
            const encounterCounts = {};
            clientHistory.forEach(entry => {
                const count = (encounterCounts[entry.clientId] || 0) + 1;
                encounterCounts[entry.clientId] = count;

                const clientData = CLIENTS.find(c => c.id === entry.clientId);
                const sigilData = SIGILS[entry.sigilTattooed];
                const hasReceivedMail = MAILS.some(mail => mail.senderId === entry.clientId);

                const clientName = clientData?.name || 'Cliente Desconhecido';
                const sigilName = sigilData?.name || 'Sigilo Desconhecido';
                const payment = entry.payment || 0;
                const sanityChange = entry.sanityChange || 0;
                const outcomeText = this.formatOutcome(entry.outcome);

                contentHtml += `
                    <div class="chronicle-entry">
                        <h3 class="chronicle-header">${count}º Encontro: ${clientName} (Dia ${entry.day})</h3>
                        <div class="chronicle-details">
                            <div class="detail-item"><span class="detail-label">Resultado:</span><span class="detail-value">${outcomeText}</span></div>
                            <div class="detail-item"><span class="detail-label">Sigilo Tatuado:</span><span class="detail-value">${sigilName}</span></div>
                            <div class="detail-item"><span class="detail-label">Pagamento:</span><span class="detail-value ${payment > 0 ? 'positive' : ''}">${payment} Moedas</span></div>
                            <div class="detail-item"><span class="detail-label">Impacto na Sanidade:</span><span class="detail-value ${sanityChange >= 0 ? 'positive' : 'negative'}">${sanityChange > 0 ? '+' : ''}${sanityChange}</span></div>
                            <div class="detail-item"><span class="detail-label">Correspondência:</span><span class="detail-value mail-status ${hasReceivedMail ? 'has-mail' : 'no-mail'}">${hasReceivedMail ? 'Carta Recebida' : 'Nenhuma Carta'}</span></div>
                        </div>
                    </div>
                `;
            });
        } else {
            contentHtml += '<p class="placeholder-text">Nenhum cliente registrado nas crônicas ainda.</p>';
        }
        contentHtml += `</div>`;
        this.dom.dynamicContentArea.innerHTML = contentHtml;
    }
    
    formatOutcome(outcomeKey) {
        const outcomes = {
            'success': 'Trabalho Impecável', 'fail_minigame': 'Mão Trêmula', 'wrong_sigil': 'Erro de Julgamento', 'corrected_sigil': 'Correção Realizada', 'accepted_corrupted': 'Pacto Sombrio Aceito', 'refused_prohibited': 'Recusa Prudente', 'accepted_prohibited': 'Invocação Proibida', 'accepted_normal': 'Trabalho Padrão'
        };
        return outcomes[outcomeKey] || outcomeKey || 'Desconhecido';
    }

    renderArtefatosTab() {
        let contentHtml = '<div class="artefact-list">';
        const purchasedUpgrades = this.gameState.purchasedUpgrades || new Set();
        const craftingIngredients = this.gameState.craftingIngredients || new Set();

        if (purchasedUpgrades.size === 0 && craftingIngredients.size === 0) {
            contentHtml += '<p class="placeholder-text">Nenhuma ferramenta especial ou ingrediente foi adquirido.</p>';
        } else {
            purchasedUpgrades.forEach(upgradeId => {
                const upgrade = UPGRADES[upgradeId];
                if (upgrade) {
                    contentHtml += `
                        <div class="artefact-entry permanent-upgrade">
                            <div class="artefact-details">
                                <h3 class="artefact-name">${upgrade.name}</h3>
                                <p class="artefact-description">${upgrade.description}</p>
                            </div>
                            <span class="artefact-type">Upgrade Permanente</span>
                        </div>
                    `;
                }
            });

            craftingIngredients.forEach(ingredientId => {
                const ingredient = ELEMENTOS[ingredientId];
                if (ingredient) {
                    contentHtml += `
                        <div class="artefact-entry crafting-ingredient">
                            <div class="artefact-details">
                                <h3 class="artefact-name">${this.formatItemName(ingredientId)}</h3>
                                <p class="artefact-description">${ingredient.descricao}</p>
                            </div>
                            <span class="artefact-type">Ingrediente de Criação</span>
                        </div>
                    `;
                }
            });
        }

        contentHtml += `</div>`;
        this.dom.dynamicContentArea.innerHTML = contentHtml;
    }

    formatItemName(name) {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    renderAnotacoesTab() {
        this.dom.dynamicContentArea.innerHTML = '<p class="placeholder-text">Anotações ainda não implementadas.</p>';
    }

    navigateContent(direction) {
        const discoveredSigilsArray = this.allSigilsArray.filter(sigil => this.gameState.discoveredSigils.has(sigil.id));
        const totalPages = Math.ceil(discoveredSigilsArray.length / this.itemsPerPage);
        const newPageIndex = this.currentPageIndex + direction;

        if (newPageIndex >= 0 && newPageIndex < totalPages) {
            this.currentPageIndex = newPageIndex;
            this.renderSimbolosTab();
            this.applyInitialSelection();
        }
    }
}
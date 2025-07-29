// js/managers/journalManager.js - VERSÃO COMPLETA E FINAL COM CRÔNICAS DETALHADAS POR PERSONAGEM

import { BESTIARY } from '../data/bestiaryData.js';
import { SIGILS } from '../data/sigilData.js';
import { CLIENTS } from '../data/clientData.js';
import { UPGRADES } from '../data/upgradeData.js';
import { ELEMENTOS, ITENS_CRIADOS } from '../data/workbenchData.js';
import { SPECIAL_ITEMS } from '../data/specialItemData.js';
import { generateSigilDrawing, SigilAnimator } from './journalUIManager.js';

export class JournalManager {
    constructor() {
        console.log('[JournalManager] 🚀 Manager instanciado e pronto para iniciar.');
        this.dom = {
            todasAsCenas: document.querySelectorAll('.cena'),
            cenaSelecaoSigilos: document.getElementById('cena-selecao-sigilos'),
            btnSigilos: document.getElementById('btn-sigilos'),
            btnInventario: document.getElementById('btn-inventario'),
            btnVinculos: document.getElementById('btn-vinculos'),
            sigiloAtivoImg: document.getElementById('sigilo-ativo-img'),
            sigiloAtivoNome: document.getElementById('sigilo-ativo-nome'),
            barraSanidadeProgresso: document.querySelector('.barra-sanidade-progresso'),
            listaInventario: document.getElementById('lista-inventario'),
            sigilSelectionGrid: document.getElementById('sigil-selection-grid'),
            menuVinculos: document.querySelector('.menu-vinculos'),
            abasVinculos: document.querySelectorAll('.conteudo-vinculos-secao'),
            cronicasContainer: document.getElementById('vinculos-cronicas'),
            bestiarioLista: document.getElementById('bestiario-lista'),
            bestiarioDisplayImg: document.getElementById('bestiario-display-img'),
            bestiarioDisplayNome: document.getElementById('bestiario-display-nome'),
            bestiarioDisplayDesc: document.getElementById('bestiario-display-desc'),
            anotacoesContainer: document.getElementById('vinculos-anotacoes'),
            popupDetalhes: document.getElementById('popup-item-detalhes'),
            popupNomeItem: document.getElementById('popup-nome-item'),
            popupDescricaoItem: document.getElementById('popup-descricao-item'),
            btnVoltar: document.getElementById('back-to-game-btn'),
        };
        
        this.gameState = {};
        this.cenaAtivaId = null;
        this.anotacoesTextarea = null;
        this.tempSigilChoice = null;

        this.init();
    }

    init() {
        console.log('[init] 🏁 Iniciando o JournalManager...');
        this.loadGameState();
        this.renderAll();
        this.bindEvents();
        console.log('[init] ✅ JournalManager inicializado com sucesso.');
    }

    mudarCena(idDaCenaParaMostrar) {
        console.log(`[mudarCena] 🎬 Trocando para a cena: ${idDaCenaParaMostrar || 'Nenhuma (fechando)'}`);
        if (idDaCenaParaMostrar === this.cenaAtivaId) idDaCenaParaMostrar = null;
        this.dom.todasAsCenas.forEach(cena => cena.classList.toggle('hidden', cena.id !== idDaCenaParaMostrar));
        
        const botoesNav = [this.dom.btnInventario, this.dom.btnSigilos, this.dom.btnVinculos];
        botoesNav.forEach(btn => {
            const cenaCorrespondente = `cena-${btn.id.split('-')[1]}`;
            btn.classList.toggle('active', cenaCorrespondente === idDaCenaParaMostrar);
        });
        this.cenaAtivaId = idDaCenaParaMostrar;
    }
    
    renderAll() {
        console.log('[renderAll] 🎨 Desenhando todos os componentes da UI...');
        this.renderSanityBar();
        this.renderActiveSigil();
        this.renderInventory();
        this.renderSigilSelection();
        this.renderBestiary();
        this.renderCronicas();
        this.renderAnotacoes();
    }

    renderSanityBar() {
        const sanidadeAtual = this.gameState.sanity ?? 100;
        const sanidadePercentual = Math.max(0, Math.min(100, sanidadeAtual));
        this.dom.barraSanidadeProgresso.style.width = `${sanidadePercentual}%`;
    }

    renderActiveSigil() {
        this.updateSigilDisplay(this.gameState.playerSigilChoice);
    }
    
    renderTempActiveSigil() {
        console.log(`[renderTempActiveSigil] 🖼️ Atualizando display visual para o sigilo temporário: ${this.tempSigilChoice}`);
        this.updateSigilDisplay(this.tempSigilChoice);
    }
    
    updateSigilDisplay(sigilId) {
        const sigilData = SIGILS[sigilId];
        this.dom.sigiloAtivoImg.innerHTML = '';
        if (sigilData) {
            this.dom.sigiloAtivoNome.textContent = sigilData.name;
            const nodes = [sigilData.startNode, ...sigilData.segments.map(s => s.end)];
            this.dom.sigiloAtivoImg.innerHTML = generateSigilDrawing(nodes);
            this.dom.sigiloAtivoImg.style.backgroundImage = 'none';
        } else {
            this.dom.sigiloAtivoNome.textContent = "Nenhum Sigilo";
            this.dom.sigiloAtivoImg.style.backgroundImage = `url('https://via.placeholder.com/98x144/ffffff/1a1a1a?text=?')`;
        }
    }
    
    renderInventory() {
        this.dom.listaInventario.innerHTML = '';
        const upgrades = this.gameState.purchasedUpgrades ? Array.from(this.gameState.purchasedUpgrades) : [];
        const ingredients = this.gameState.craftingIngredients ? Object.keys(this.gameState.craftingIngredients) : [];
        const inks = this.gameState.craftedInks ? Object.keys(this.gameState.craftedInks) : [];
        const specialItems = this.gameState.specialItems || [];

        const inventario = [...upgrades, ...ingredients, ...inks, ...specialItems];
        
        if (inventario.length === 0) { 
            this.dom.listaInventario.innerHTML = '<li>Inventário vazio.</li>'; 
            return; 
        }

        inventario.forEach(itemId => {
            const ingredientQuantity = this.gameState.craftingIngredients[itemId];
            const inkQuantity = this.gameState.craftedInks[itemId];

            if ((ingredientQuantity !== undefined && ingredientQuantity <= 0) || (inkQuantity !== undefined && inkQuantity <= 0)) {
                return;
            }

            const itemData = UPGRADES[itemId] || ELEMENTOS[itemId] || ITENS_CRIADOS[itemId] || SPECIAL_ITEMS[itemId];
            
            if (itemData) {
                const li = document.createElement('li');
                li.className = 'item-inventario';
                li.dataset.nome = itemData.name || this._formatName(itemId);
                li.dataset.descricao = itemData.description || itemData.descricao;
                
                let quantityText = '';
                if (ingredientQuantity) {
                    quantityText = `<span class="item-quantity">(x${ingredientQuantity})</span>`;
                } else if (inkQuantity) {
                    quantityText = `<span class="item-quantity">(x${inkQuantity})</span>`;
                }

                const iconSrc = itemData.iconUrl || 'https://via.placeholder.com/50/ffffff/1a1a1a?text=?';
                li.innerHTML = `<img src="${iconSrc}" alt="${itemData.name || itemId}"><div class="item-info"><strong>${itemData.name || this._formatName(itemId)}</strong></div>${quantityText}`;
                this.dom.listaInventario.appendChild(li);
            } else {
                console.warn(`[JournalManager.renderInventory] Não foram encontrados dados para o item com ID: ${itemId}`);
            }
        });
    }

    renderSigilSelection() {
        this.dom.sigilSelectionGrid.innerHTML = '';
        const discoveredSigils = this.gameState.discoveredSigils || new Set();
        
        discoveredSigils.forEach(sigilId => {
            const sigilData = SIGILS[sigilId];
            if (sigilData) {
                const sigilBox = document.createElement('div');
                sigilBox.className = 'box-selecao-sigilo';
                sigilBox.dataset.sigilId = sigilData.id;
                sigilBox.classList.toggle('selected', sigilData.id === this.tempSigilChoice);

                const drawingArea = document.createElement('div');
                drawingArea.className = 'sigil-drawing-area';

                const canvas = document.createElement('canvas');
                canvas.className = 'sigil-preview-canvas';
                
                const title = document.createElement('h3');
                title.textContent = sigilData.name;

                drawingArea.appendChild(canvas);
                sigilBox.appendChild(drawingArea);
                sigilBox.appendChild(title);
                this.dom.sigilSelectionGrid.appendChild(sigilBox);

                new SigilAnimator(canvas, sigilData);
            }
        });
    }

    renderBestiary() {
        this.dom.bestiarioLista.innerHTML = '';
        const discoveredBeasts = this.gameState.discoveredBeasts || new Set();
        if (discoveredBeasts.size === 0) { this.dom.bestiarioLista.innerHTML = '<p>Nenhuma criatura catalogada.</p>'; return; }
        discoveredBeasts.forEach(beastId => {
            const beastData = BESTIARY[beastId];
            if (beastData) {
                const div = document.createElement('div'); div.className = 'bestiario-menu-item';
                div.dataset.nome = beastData.name; div.dataset.descricao = beastData.description; div.dataset.imagemGrande = beastData.imageUrl;
                div.innerHTML = `<img src="${beastData.imageUrl || 'https://via.placeholder.com/40'}" alt="${beastData.name}"> <div><strong>${beastData.name}</strong></div>`;
                this.dom.bestiarioLista.appendChild(div);
            }
        });
    }
    
    renderCronicas() {
        this.dom.cronicasContainer.innerHTML = '';
        const history = this.gameState.clientHistory || [];
        const readMails = this.gameState.readMailIds ? Array.from(this.gameState.readMailIds) : [];

        if (history.length === 0 && !readMails.some(id => id.startsWith('kett_'))) {
            this.dom.cronicasContainer.innerHTML = '<p>Nenhum registro de encontros ou correspondências importantes.</p>';
            return;
        }

        const characterProfiles = {};

        history.forEach(entry => {
            const clientData = CLIENTS.find(c => c.id === entry.clientId);
            if (!clientData) return;

            const name = clientData.name;
            if (!characterProfiles[name]) {
                characterProfiles[name] = {
                    name: name,
                    description: clientData.chronicleDescription || "Um dos muitos rostos atormentados de Port Blackwood.",
                    daysEncountered: [],
                    entries: []
                };
            }
            characterProfiles[name].daysEncountered.push(entry.day);
            characterProfiles[name].entries.push(entry);
        });
        
        const kettLettersRead = readMails.filter(id => id.startsWith('kett_')).length;
        if (kettLettersRead > 0) {
            characterProfiles["Kett, a Bibliotecária"] = {
                name: "Kett, a Bibliotecária",
                description: "Uma aliada confiável e guardiã dos segredos de Abner. Suas cartas são um farol de verdade na névoa de mentiras.",
                daysEncountered: [],
                entries: [],
                isCorrespondence: true,
                correspondenceCount: kettLettersRead
            };
        }

        Object.values(characterProfiles).forEach(profile => {
            const profileDiv = document.createElement('div');
            profileDiv.className = 'chronicle-character-profile';

            const uniqueEncounters = new Set(profile.daysEncountered).size;
            
            const counterText = profile.isCorrespondence 
                ? `Correspondências: ${profile.correspondenceCount}` 
                : `Encontros: ${uniqueEncounters}`;

            let entriesHTML = '';
            const actionableEntries = profile.entries.filter(e => e.outcome && !e.outcome.includes('narrative') && !e.outcome.includes('dialogue'));

            if (actionableEntries.length > 0) {
                entriesHTML += `<details><summary>Ver encontros detalhados</summary><ul>`;
                
                actionableEntries.forEach(entry => {
                    let outcomeText = '';
                    let outcomeClass = 'outcome-neutral';

                    switch (entry.outcome) {
                        case 'dispensed_no_ink': outcomeText = 'Dispensado (Falta de Tinta)'; outcomeClass = 'outcome-fail'; break;
                        case 'refused_prohibited': outcomeText = 'Recusado (Sigilo Proibido)'; outcomeClass = 'outcome-success'; break;
                        case 'success':
                            if (entry.method === 'blood') { outcomeText = 'Sucesso (Tatuagem de Sangue)'; outcomeClass = 'outcome-special'; }
                            else if (entry.method && entry.method !== 'normal') { outcomeText = `Sucesso (Tinta Especial)`; outcomeClass = 'outcome-special'; }
                            else { outcomeText = 'Sucesso'; outcomeClass = 'outcome-success'; }
                            break;
                        case 'fail_minigame': outcomeText = 'Falha (Mão Trêmula)'; outcomeClass = 'outcome-fail'; break;
                        case 'wrong_sigil': outcomeText = 'Falha (Sigilo Errado)'; outcomeClass = 'outcome-fail'; break;
                        case 'purified_tattoo': outcomeText = 'Tatuagem Purificada'; outcomeClass = 'outcome-success'; break;
                        case 'refused_help': outcomeText = 'Ajuda Recusada'; outcomeClass = 'outcome-neutral'; break;
                        default: outcomeText = entry.outcome || 'Não registrado'; break;
                    }
                    
                    entriesHTML += `
                        <li>
                            <strong>Dia ${entry.day}:</strong>
                            <span class="chronicle-outcome ${outcomeClass}">${outcomeText}</span>
                            <p class="chronicle-notes"><em>"${entry.notes || 'Nenhuma anotação adicional.'}"</em></p>
                        </li>
                    `;
                });
                entriesHTML += `</ul></details>`;
            }

            profileDiv.innerHTML = `
                <div class="profile-header">
                    <h3>${profile.name}</h3>
                    <span class="encounter-count">${counterText}</span>
                </div>
                <p class="profile-description"><em>${profile.description}</em></p>
                ${entriesHTML}
            `;
            this.dom.cronicasContainer.appendChild(profileDiv);
        });
    }

    renderAnotacoes() {
        if (!this.anotacoesTextarea) {
            this.dom.anotacoesContainer.innerHTML = '';
            this.anotacoesTextarea = document.createElement('textarea');
            this.anotacoesTextarea.addEventListener('input', (e) => {
                this.gameState.anotacoes = e.target.value;
            });
            this.dom.anotacoesContainer.appendChild(this.anotacoesTextarea);
        }
        this.anotacoesTextarea.value = this.gameState.anotacoes || '';
    }

    loadGameState() {
        const savedData = localStorage.getItem('gameState');
        if (savedData) {
            this.gameState = JSON.parse(savedData);
            if (typeof this.gameState.sanity !== 'number') { this.gameState.sanity = 100; }
            this.gameState.discoveredSigils = new Set(this.gameState.discoveredSigils || []);
            this.gameState.discoveredBeasts = new Set(this.gameState.discoveredBeasts || []);
            this.gameState.purchasedUpgrades = new Set(this.gameState.purchasedUpgrades || []);
            this.gameState.craftingIngredients = this.gameState.craftingIngredients || {};
            this.gameState.craftedInks = this.gameState.craftedInks || {};
            this.gameState.specialItems = this.gameState.specialItems || [];
        } else {
            console.warn('[loadGameState] ⚠️ Nenhum estado de jogo encontrado. Usando valores padrão.');
            this.gameState = { sanidade: 100, discoveredSigils: new Set(['s01', 's04']), discoveredBeasts: new Set(['deep_one']), clientHistory: [], anotacoes: "", purchasedUpgrades: new Set(), craftingIngredients: {}, craftedInks: {}, specialItems: [] };
        }
        this.tempSigilChoice = this.gameState.playerSigilChoice;
        console.log('[loadGameState] 💾 Estado do jogo carregado:', this.gameState);
    }

    saveAndExit() {
        console.log('[saveAndExit] 💾 Tentando salvar e sair...');
        if (this.gameState.tutorialStep === 'journal_prompt') {
            console.log('[saveAndExit] 🎓 Etapa do tutorial detectada. Atualizando para "final_wait".');
            this.gameState.tutorialStep = 'final_wait';
        }
        console.log(`[saveAndExit] ✅ Confirmando sigilo final: ${this.tempSigilChoice || 'Nenhum'}`);
        this.gameState.playerSigilChoice = this.tempSigilChoice;
        
        const stateToSave = {
            ...this.gameState,
            discoveredSigils: Array.from(this.gameState.discoveredSigils),
            discoveredBeasts: Array.from(this.gameState.discoveredBeasts),
            purchasedUpgrades: Array.from(this.gameState.purchasedUpgrades),
        };
        console.log('[saveAndExit] 📤 Estado final a ser salvo:', stateToSave);
        localStorage.setItem('gameState', JSON.stringify(stateToSave));
        
        console.log('[saveAndExit] ➡️ Redirecionando para game.html');
        window.location.href = '/game.html';
    }

    bindEvents() {
        console.log('[bindEvents] 🔗 Vinculando todos os listeners de eventos...');
        this.dom.btnInventario.addEventListener('click', () => this.mudarCena('cena-inventario'));
        this.dom.btnVinculos.addEventListener('click', () => this.mudarCena('cena-vinculos'));
        this.dom.btnSigilos.addEventListener('click', () => this.mudarCena('cena-selecao-sigilos'));
        this.dom.btnVoltar.addEventListener('click', () => this.saveAndExit());

        this.dom.listaInventario.addEventListener('mouseover', (e) => {
            const item = e.target.closest('.item-inventario');
            if (item) {
                this.dom.popupNomeItem.textContent = item.dataset.nome;
                this.dom.popupDescricaoItem.textContent = item.dataset.descricao;
                this.dom.popupDetalhes.classList.remove('hidden');
            }
        });
        this.dom.listaInventario.addEventListener('mouseout', () => this.dom.popupDetalhes.classList.add('hidden'));

        if (this.dom.menuVinculos) {
            this.dom.menuVinculos.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const alvoId = e.target.dataset.alvo;
                    console.log(`[bindEvents] 📂 Aba de Vínculos alterada para: ${alvoId}`);
                    this.dom.menuVinculos.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                    this.dom.abasVinculos.forEach(secao => secao.classList.toggle('hidden', secao.id !== alvoId));
                }
            });
        }
        
        this.dom.bestiarioLista.addEventListener('click', e => {
            const menuItem = e.target.closest('.bestiario-menu-item');
            if(menuItem) {
                console.log(`[bindEvents] 🐲 Bestiário: Visualizando '${menuItem.dataset.nome}'`);
                this.dom.bestiarioDisplayNome.textContent = menuItem.dataset.nome;
                this.dom.bestiarioDisplayDesc.textContent = menuItem.dataset.descricao;
                this.dom.bestiarioDisplayImg.src = menuItem.dataset.imagemGrande;
                this.dom.bestiarioLista.querySelectorAll('.active').forEach(i => i.classList.remove('active'));
                menuItem.classList.add('active');
            }
        });
        
        this.dom.sigilSelectionGrid.addEventListener('click', e => {
            const sigilBox = e.target.closest('.box-selecao-sigilo');
            if(sigilBox) {
                const sigilId = sigilBox.dataset.sigilId;
                console.log(`[bindEvents] 🖱️ Sigilo selecionado (temporariamente): ${sigilId}`);
                this.tempSigilChoice = sigilId;
                this.renderTempActiveSigil();
                this.renderSigilSelection();
            }
        });
        console.log('[bindEvents] ✅ Listeners vinculados com sucesso.');
    }

    _formatName(name) {
        if (!name) return '';
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
}
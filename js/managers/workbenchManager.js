// js/managers/workbenchManager.js - VERSÃO CORRIGIDA

import { ELEMENTOS, TINTAS, RECEITAS } from '../data/workbenchData.js';

export class WorkbenchManager {
    constructor() {
        this.dom = {
            craftingTable: document.getElementById('craftingTable'),
            elementosDisponiveisDiv: document.getElementById('elementosDisponiveis'),
            tintasDisponiveisDiv: document.getElementById('tintasDisponiveis'),
            craftButton: document.getElementById('craftButton'),
            resultDisplay: document.getElementById('resultDisplay'),
        };

        this.elementosNaMesa = [];
        this.tintaNaMesa = null;
        this.playerIngredients = new Set();
        
        this.init();
    }

    init() {
        this.loadGameState();
        this.bindEvents();
        this.renderAvailableItems();
        this.renderCraftingTable();
    }

    loadGameState() {
        const gameState = JSON.parse(localStorage.getItem('gameState')) || {};
        this.playerIngredients = new Set(gameState.craftingIngredients || []);
    }

    bindEvents() {
        this.dom.craftButton.addEventListener('click', this.handleCraftClick.bind(this));
    }

    renderAvailableItems() {
        this.dom.elementosDisponiveisDiv.innerHTML = '';
        this.dom.tintasDisponiveisDiv.innerHTML = '';

        if (this.playerIngredients.size === 0) {
            this.dom.elementosDisponiveisDiv.innerHTML = '<p style="color: #bbb; font-style: italic;">Nenhum ingrediente arcano em seu inventário.</p>';
        } else {
            this.playerIngredients.forEach(key => {
                const itemData = ELEMENTOS[key];
                if (itemData) {
                    this._renderSingleItem(this.dom.elementosDisponiveisDiv, key, itemData, 'elemento');
                }
            });
        }
        
        for (const key in TINTAS) {
            this._renderSingleItem(this.dom.tintasDisponiveisDiv, key, TINTAS[key], 'tinta');
        }

        this._updateAvailableItemVisuals();
    }

    _renderSingleItem(container, key, item, type) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.dataset.itemName = key;
        itemDiv.dataset.itemType = type;
        itemDiv.innerHTML = `<span style="font-size: 2em; margin-bottom: 5px;">${type === 'elemento' ? '⚛️' : '💧'}</span>${this._formatName(key)}<span class="tooltip">${item.descricao}</span>`;

        if (type === 'tinta') {
            itemDiv.style.borderColor = item.color;
            itemDiv.style.color = item.color;
        }

        itemDiv.addEventListener('click', () => this.handleItemClick(key, type));
        container.appendChild(itemDiv);
    }

    handleItemClick(itemName, itemType) {
        if (itemType === 'elemento') {
            if (this.elementosNaMesa.includes(itemName)) {
                this.elementosNaMesa = this.elementosNaMesa.filter(item => item !== itemName);
            } else if (this.elementosNaMesa.length < 3) {
                this.elementosNaMesa.push(itemName);
            }
        } else if (itemType === 'tinta') {
            if (this.tintaNaMesa === itemName) {
                this.tintaNaMesa = null;
            } else {
                this.tintaNaMesa = itemName;
            }
        }
        this.renderCraftingTable();
        this._updateAvailableItemVisuals();
    }

    _updateAvailableItemVisuals() {
        this.dom.elementosDisponiveisDiv.querySelectorAll('.item').forEach(el => {
            el.classList.toggle('selected', this.elementosNaMesa.includes(el.dataset.itemName));
        });
        this.dom.tintasDisponiveisDiv.querySelectorAll('.item').forEach(el => {
            el.classList.toggle('selected', this.tintaNaMesa === el.dataset.itemName);
        });
    }

    renderCraftingTable() {
        this.dom.craftingTable.innerHTML = '';

        if (this.elementosNaMesa.length === 0 && this.tintaNaMesa === null) {
            this.dom.craftingTable.innerHTML = '<p style="color: #bbb; font-style: italic;">Arraste ou clique nos elementos e na tinta para adicioná-los aqui.</p>';
            return;
        }

        this.elementosNaMesa.forEach(itemName => {
            const itemDiv = this._createTableItem(itemName, 'elemento');
            this.dom.craftingTable.appendChild(itemDiv);
        });

        if (this.tintaNaMesa) {
            const itemDiv = this._createTableItem(this.tintaNaMesa, 'tinta');
            this.dom.craftingTable.appendChild(itemDiv);
        }
    }

    _createTableItem(itemName, itemType) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        if (itemType === 'elemento') {
            const itemData = ELEMENTOS[itemName];
            itemDiv.innerHTML = `<span style="font-size: 2em; margin-bottom: 5px;">⚛️</span>${this._formatName(itemName)}`;
            itemDiv.title = itemData.descricao;
        } else {
            const itemData = TINTAS[itemName];
            itemDiv.innerHTML = `<span style="font-size: 2em; margin-bottom: 5px; color: ${itemData.color};">💧</span>${this._formatName(itemName)}`;
            itemDiv.title = itemData.descricao;
            itemDiv.style.borderColor = itemData.color;
            itemDiv.style.color = itemData.color;
        }
        return itemDiv;
    }

    handleCraftClick() {
        if (this.elementosNaMesa.length === 0 && this.tintaNaMesa === null) {
            this.dom.resultDisplay.innerHTML = '<p style="color: #ffcc66;">Selecione pelo menos um elemento ou uma tinta para infundir o sigilo!</p>';
            return;
        }

        const resultado = this._calculateCraftingResult();
        this.displayResult(resultado);
        this.resetCraftingTable();
    }
    
    _calculateCraftingResult() {
        let pontuacaoBom = 0;
        let pontuacaoRuim = 0;
        let pontuacaoCorrupto = 0;

        const elementosOrdenados = [...this.elementosNaMesa].sort();
        for (const receita of RECEITAS) {
            const receitaCombinacaoOrdenada = [...receita.combinacao].sort();
            const tintaMatch = !receita.tinta || receita.tinta === this.tintaNaMesa;
            if (JSON.stringify(elementosOrdenados) === JSON.stringify(receitaCombinacaoOrdenada) && tintaMatch) {
                return receita.resultado;
            }
        }

        for (const elementoNome of this.elementosNaMesa) {
            if (ELEMENTOS[elementoNome]) {
                pontuacaoBom += ELEMENTOS[elementoNome].afinidade.bom;
                pontuacaoRuim += ELEMENTOS[elementoNome].afinidade.ruim;
                pontuacaoCorrupto += ELEMENTOS[elementoNome].afinidade.corrupto;
            }
        }

        if (this.tintaNaMesa && TINTAS[this.tintaNaMesa]) {
            const mod = TINTAS[this.tintaNaMesa].afinidadeMod;
            pontuacaoBom += mod.bom;
            pontuacaoRuim += mod.ruim;
            pontuacaoCorrupto += mod.corrupto;
        }

        pontuacaoBom = Math.max(0, pontuacaoBom);
        pontuacaoRuim = Math.max(0, pontuacaoRuim);
        pontuacaoCorrupto = Math.max(0, pontuacaoCorrupto);
        
        let statusFinal = "neutro", tipoResultado = "Manifestação Desconhecida", descricaoResultado = "As energias se chocam em um padrão imprevisível.";

        if (pontuacaoBom > pontuacaoRuim && pontuacaoBom > pontuacaoCorrupto) {
            statusFinal = "bom"; tipoResultado = "Bênção Eldritch"; descricaoResultado = "Uma energia positiva irradia, trazendo proteção e insights.";
        } else if (pontuacaoCorrupto > pontuacaoBom && pontuacaoCorrupto > pontuacaoRuim) {
            statusFinal = "corrupto"; tipoResultado = "Aberração Cósmica"; descricaoResultado = "A realidade se distorce, e algo de outro plano é despertado. A loucura se aproxima.";
        } else if (pontuacaoRuim > pontuacaoBom && pontuacaoRuim > pontuacaoCorrupto) {
            statusFinal = "ruim"; tipoResultado = "Maldição Antiga"; descricaoResultado = "Um presságio sombrio se abate, o infortúnio se aproxima lentamente.";
        } else if (pontuacaoBom === pontuacaoRuim && pontuacaoBom > pontuacaoCorrupto) {
            statusFinal = "neutro"; tipoResultado = "Equilíbrio Tênue"; descricaoResultado = "Um balanço delicado entre a fortuna e o desastre. Um resultado ambíguo.";
        } else if (pontuacaoCorrupto === pontuacaoRuim && pontuacaoCorrupto > pontuacaoBom) {
            statusFinal = "corrupto"; tipoResultado = "Decadência Inevitável"; descricaoResultado = "O sigilo se manifesta com uma presença maligna e decadente.";
        } else if (pontuacaoBom === pontuacaoCorrupto && pontuacaoBom > pontuacaoRuim) {
            statusFinal = "neutro"; tipoResultado = "Caos Ordenado"; descricaoResultado = "Uma força paradoxal emerge, perigosa, mas com um toque de beleza estranha.";
        } else {
            statusFinal = "neutro"; tipoResultado = "Manifestação Inesperada"; descricaoResultado = "As estrelas se alinham de uma forma estranha, gerando um efeito imprevisto.";
        }

        return { tipo: tipoResultado, descricao: descricaoResultado, status: statusFinal };
    }
    
    displayResult(resultado) {
        this.dom.resultDisplay.innerHTML = `
            <p><strong>Tipo de Manifestação:</strong> ${resultado.tipo}</p>
            <p><strong>Status Geral:</strong> <span class="result-status status-${resultado.status}">${resultado.status.toUpperCase()}</span></p>
            <p><strong>Descrição:</strong> ${resultado.descricao}</p>
        `;
    }

    resetCraftingTable() {
        this.elementosNaMesa = [];
        this.tintaNaMesa = null;
        this.renderCraftingTable();
        this._updateAvailableItemVisuals();
    }

    _formatName(name) {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
}
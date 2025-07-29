// js/data/upgradeData.js - VERSÃO FINAL COM TODOS OS ITENS DA LOJA

export const UPGRADES = {
    // ===================================================================
    //  1. ITENS CONSUMÍVEIS (Uso Imediato)
    // ===================================================================
    refill_ink: {
        name: "Dose de Tinta Espectral", cost: 30, description: "Recarrega uma carga de tinta arcana.",
        type: 'consumable',
        effect: (gameState) => { if (gameState.inkCharges < 3) gameState.inkCharges++; }
    },
    coffee: {
        name: "Café Forte", cost: 20, description: "Restaura 5 pontos de Sanidade.",
        type: 'consumable',
        effect: (gameState) => { gameState.sanity = Math.min(100, gameState.sanity + 5); }
    },

    // ===================================================================
    //  2. UPGRADES PERMANENTES (Ferramentas e Melhorias)
    // ===================================================================
    luminaria_da_alma: { // <-- RENOMEADO de 'lamp'
        name: "Luminária da Alma", cost: 60, description: "Uma luz mais forte que revela a numeração de todos os pontos no minigame.",
        type: 'permanent'
    },
    brace: {
        name: "Munhequeira de Firmeza", cost: 100, description: "Firma o pulso. Reduz o tremor dos eventos de dor em 50%.",
        type: 'permanent'
    },
    // <<< NOVO ITEM PERMANENTE >>>
    // ... outros itens
    lupa_analise: { 
        name: "Lupa de Análise", 
        cost: 45, // O preço
        description: "Uma lente tratada com sais arcanos...",
        type: 'permanent'
    },
    // <<< NOVO >>>
    decalque_arcano: {
        name: "Decalque Arcano", cost: 150, // Custo alto, como solicitado
        description: "Um decalque especial que revela o caminho completo do sigilo durante o minigame.",
        type: 'permanent'
    },
    // <<< NOVO >>>
    borrifador_base: {
        name: "Borrifador de Lótus (Vazio)", cost: 80,
        description: "A ferramenta base. Compre-o uma vez para habilitar a criação e o uso de recargas.",
        type: 'permanent'
    },
    
    // ===================================================================
    //  3. INGREDIENTES DE CRIAÇÃO (Compráveis em Quantidade)
    // ===================================================================
    poeiraEstelar: { name: "Poeira Estelar", cost: 40, description: "Ingrediente alquímico com um resquício de ordem cósmica.", type: 'ingredient', id: 'poeiraEstelar' },
    póDeSonhos: { name: "Pó de Sonhos", cost: 35, description: "Partículas de reinos oníricos, úteis mas imprevisíveis.", type: 'ingredient', id: 'póDeSonhos' },
    fragmentoDeCometa: { name: "Fragmento de Cometa", cost: 50, description: "Ingrediente volátil para misturas com um toque de caos.", type: 'ingredient', id: 'fragmentoDeCometa' },
    // <<< NOVOS INGREDIENTES PARA A RECARGA >>>
    agua_purificada: {
        name: "Água de Backwood", cost: 10, // Custo baixo, como solicitado
        description: "A base de abner, para qualquer mistura de recarga de borrifador e tintas.",
        type: 'ingredient',
        id: 'agua_purificada'
    },
    sabao_especial: {
        name: "Sabão de Ervas Especiais", cost: 15, // Custo baixo
        description: "Um sabão com propriedades calmantes, essencial para a recarga do borrifador.",
        type: 'ingredient',
        id: 'sabao_especial'
    }
};
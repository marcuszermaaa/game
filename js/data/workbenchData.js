// js/data/workbenchData.js - VERSÃO FINAL COM RECEITA DO BORRIFADOR

// Os ingredientes que o jogador pode ter
export const ELEMENTOS = {
    "bileDeProfundo": { descricao: "Uma secreção viscosa e iridescente." },
    "poeiraEstelar": { descricao: "Brilhos de estrelas mortas." },
    "fragmentoDeCometa": { descricao: "Cacos de corpos celestes errantes." },
    "seivaDeYggdrasil": { descricao: "A essência da Árvore Mundo." },
    "olhoDeShoggoth": { descricao: "Um órgão pulsante de uma massa amorfa." },
    "cristalDeKadath": { descricao: "Formado nas profundezas oníricas." },
    "ossoDeProfundo": { descricao: "Remanescente de uma criatura abissal." },
    "póDeSonhos": { descricao: "Partículas coletadas de reinos oníricos." },
    // <<< NOVOS >>> (Apenas a descrição, o resto é definido em upgradeData.js)
    "agua_purificada": { descricao: "Água benta, livre de impurezas físicas e espirituais." },
    "sabao_especial": { descricao: "Sabão feito com ervas raras que acalmam a pele e o espírito." }
};

// Os itens que podem ser CRIADOS na bancada
export const ITENS_CRIADOS = {
    "tintaDaClarividencia": { name: "Tinta da Clarividência", description: "Amplifica a intenção, mas pune erros." },
    "tintaDoAbismo": { name: "Tinta do Abismo", description: "Garante um resultado mais sombrio." },
    // <<< NOVO ITEM CRIÁVEL >>>
    "recarga_borrifador": {
        name: "Recarga de Borrifador",
        description: "Uma dose de solução calmante para o Borrifador de Lótus. Previne um evento de dor."
    }
};

// As receitas que combinam ELEMENTOS para criar ITENS_CRIADOS
export const RECEITAS = [
    { combinacao: ["poeiraEstelar", "póDeSonhos"], resultado: "tintaDaClarividencia" },
    { combinacao: ["bileDeProfundo", "ossoDeProfundo"], resultado: "tintaDoAbismo" },
    // <<< NOVA RECEITA >>>
    { 
        combinacao: ["agua_purificada", "sabao_especial"], 
        resultado: "recarga_borrifador"
    }
];
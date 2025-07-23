// js/data/workbenchData.js

export const ELEMENTOS = {
    "bileDeProfundo": {
        afinidade: { bom: 0.2, ruim: 1.5, corrupto: 2.8 },
        descricao: "Uma secreção viscosa e iridescente. Cheira a oceano e decadência."
    },
    "poeiraEstelar": {
        afinidade: { bom: 2, ruim: 0, corrupto: 0.5 },
        descricao: "Brilhos de estrelas mortas, com um resquício de ordem cósmica."
    },
    "fragmentoDeCometa": {
        afinidade: { bom: 1, ruim: 1, corrupto: 1.5 },
        descricao: "Cacos de corpos celestes errantes, trazem imprevisibilidade."
    },
    "seivaDeYggdrasil": {
        afinidade: { bom: 3, ruim: 0.5, corrupto: 0.1 },
        descricao: "A essência da Árvore Mundo, pura vitalidade ancestral."
    },
    "olhoDeShoggoth": {
        afinidade: { bom: 0, ruim: 2.5, corrupto: 4 },
        descricao: "Um órgão pulsante de uma massa amorfa, ecoa o caos primário."
    },
    "cristalDeKadath": {
        afinidade: { bom: 1.5, ruim: 0.5, corrupto: 2.5 },
        descricao: "Formado nas profundezas oníricas, conecta-se a realidades distorcidas."
    },
    "ossoDeProfundo": {
        afinidade: { bom: 0.5, ruim: 1.8, corrupto: 2.2 },
        descricao: "Remanescente de uma criatura abissal, porta segredos aquáticos e sombrios."
    },
    "póDeSonhos": {
        afinidade: { bom: 1.8, ruim: 0.2, corrupto: 1 },
        descricao: "Partículas coletadas de reinos oníricos, podem ser imprevisíveis."
    }
};

export const TINTAS = {
    "tintaDeShoggoth": {
        afinidadeMod: { bom: -1, ruim: 2, corrupto: 3 },
        descricao: "Pulsante e viscosa, extraída de uma abominação. Amplifica o horror.",
        color: "#ff6666"
    },
    "tintaEstelar": {
        afinidadeMod: { bom: 1.5, ruim: -0.5, corrupto: -0.8 },
        descricao: "Luminosa e etérea, conjurada da luz das estrelas. Tende ao benevolente.",
        color: "#66ff66"
    },
    "tintaEldritch": {
        afinidadeMod: { bom: 0.5, ruim: 1.5, corrupto: 2 },
        descricao: "Uma mescla de pesadelos e sussurros, perverte a realidade.",
        color: "#c084fc"
    }
};

export const RECEITAS = [
    {
        combinacao: ["poeiraEstelar", "seivaDeYggdrasil"],
        tinta: "tintaEstelar",
        resultado: { tipo: "Amuleto da Proteção Arcana", descricao: "Um amuleto que irradia paz e afasta sombras.", status: "bom" }
    },
    {
        combinacao: ["olhoDeShoggoth", "fragmentoDeCometa"],
        tinta: "tintaDeShoggoth",
        resultado: { tipo: "Portal da Aberração", descricao: "Um rasgo na realidade se abre, revelando horrores inimagináveis.", status: "corrupto" }
    },
    {
        combinacao: ["cristalDeKadath", "ossoDeProfundo"],
        tinta: "tintaEldritch",
        resultado: { tipo: "Visão dos Abismos", descricao: "A mente vacila diante do que foi revelado, um conhecimento proibido.", status: "ruim" }
    }
];
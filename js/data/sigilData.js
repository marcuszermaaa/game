// js/data/sigilData.js - VERSÃO ATUALIZADA COM DIÁLOGO NARRATIVO

export const SIGILS = {
    // --- Sigilos Seguros (Safe) ---
    s01: {
        id: 's01',
        name: "Selo de Repouso Tranquilo",
        type: 'safe',
        lore: "Para acalmar sonhos turbulentos e garantir uma noite de descanso.",
        startNode: { x: 0.2, y: 0.5 },
        segments: [
            { type: 'curve', end: { x: 0.5, y: 0.2 }, control: { x: 0.35, y: 0.2 }, painEvent: false },
            { type: 'curve', end: { x: 0.8, y: 0.5 }, control: { x: 0.65, y: 0.2 }, painEvent: false },
            { type: 'curve', end: { x: 0.5, y: 0.8 }, control: { x: 0.65, y: 0.8 }, painEvent: false },
            { type: 'curve', end: { x: 0.2, y: 0.5 }, control: { x: 0.35, y: 0.8 }, painEvent: false }
        ]
    },
    s02: {
        id: 's02',
        name: "Glifo do Olhar Averso",
        type: 'safe',
        lore: "Desvia a má sorte e os olhares indesejados.",
        startNode: { x: 0.5, y: 0.2 },
        segments: [
            { type: 'line', end: { x: 0.3, y: 0.8 }, painEvent: false },
            { type: 'line', end: { x: 0.7, y: 0.8 }, painEvent: false },
            { type: 'line', end: { x: 0.5, y: 0.2 }, painEvent: false }
        ]
    },
    s03: {
        id: 's03',
        name: "Espiral da Percepção",
        type: 'safe',
        lore: "Abre a mente para conhecimentos ocultos e percepções aguçadas.",
        startNode: { x: 0.5, y: 0.5 },
        segments: [
            { type: 'curve', end: { x: 0.6, y: 0.4 }, control: { x: 0.58, y: 0.55 }, painEvent: false },
            { type: 'curve', end: { x: 0.5, y: 0.3 }, control: { x: 0.65, y: 0.32 }, painEvent: false },
            { type: 'curve', end: { x: 0.4, y: 0.4 }, control: { x: 0.42, y: 0.28 }, painEvent: false },
            
            // ✨ DIÁLOGO ATUALIZADO AQUI PARA A NARRATIVA DO DIA 7 ✨
            { type: 'curve', end: { x: 0.3, y: 0.6 }, control: { x: 0.3, y: 0.5 }, painEvent: true, dialogue: "Sim! O mestre ficará satisfeito! Estou vendo!" },
            
            { type: 'curve', end: { x: 0.5, y: 0.7 }, control: { x: 0.35, y: 0.75 }, painEvent: false },
            { type: 'curve', end: { x: 0.7, y: 0.6 }, control: { x: 0.65, y: 0.78 }, painEvent: false }
        ]
    },
    s04: {
        id: 's04',
        name: "Âncora da Realidade",
        type: 'safe',
        lore: "Fortalece a conexão com o mundo tangível. A haste principal deve sempre apontar para baixo, em direção ao chão, para ancorar a mente com firmeza.",
        startNode: { x: 0.5, y: 0.2 },
        segments: [
            { type: 'line', end: { x: 0.5, y: 0.6 }, painEvent: false },
            { type: 'line', end: { x: 0.3, y: 0.5 }, painEvent: false },
            { type: 'line', end: { x: 0.5, y: 0.6 }, painEvent: false },
            { type: 'line', end: { x: 0.7, y: 0.5 }, painEvent: false },
            { type: 'line', end: { x: 0.5, y: 0.6 }, painEvent: false },
            { type: 'line', end: { x: 0.5, y: 0.8 }, painEvent: true, dialogue: "Mais firme... preciso que seja firme!" }
        ]
    },

    // --- Sigilos Corrompidos (Corrupted) ---
    s06_corrupted: {
        id: 's06_corrupted',
        name: "Selo de Proteção (Corrompido)",
        type: 'corrupted',
        correctVersion: 's04',
        lore: "Um sigilo de proteção com a âncora invertida. Não ancora a alma, a arranca. Abner alerta para sua instabilidade.",
        startNode: { x: 0.5, y: 0.8 },
        segments: [
            { type: 'line', end: { x: 0.5, y: 0.4 }, painEvent: true, dialogue: "Arde! Por que está ardendo tanto?!" },
            { type: 'line', end: { x: 0.3, y: 0.5 }, painEvent: false },
            { type: 'line', end: { x: 0.5, y: 0.4 }, painEvent: false },
            { type: 'line', end: { x: 0.7, y: 0.5 }, painEvent: false },
            { type: 'line', end: { x: 0.5, y: 0.4 }, painEvent: false },
            { type: 'line', end: { x: 0.5, y: 0.2 }, painEvent: true, dialogue: "Está errado... sinto que está errado!" }
        ],
        corruptionPoints: [
            { x: 0.5, y: 0.6, note: "A haste está invertida. Uma âncora que aponta para cima não ancora nada, apenas expõe a alma ao abismo." }
        ]
    },

    // --- Sigilos Proibidos (Prohibited) ---
    s05_prohibited: {
        id: 's05_prohibited',
        name: "O Olho que se Abre",
        type: 'prohibited',
        lore: "Abner foi enfático: NUNCA. TATUAR. ISTO. EM. NINGUÉM. Abre uma porta que não pode ser fechada.",
        startNode: { x: 0.5, y: 0.2 },
        segments: [
            { type: 'curve', end: { x: 0.8, y: 0.5 }, control: { x: 0.75, y: 0.2 }, painEvent: true, dialogue: "Estou vendo... oh, deuses, estou vendo!" },
            { type: 'curve', end: { x: 0.5, y: 0.8 }, control: { x: 0.8, y: 0.75 }, painEvent: true, dialogue: "Pare! É demais!" },
            { type: 'curve', end: { x: 0.2, y: 0.5 }, control: { x: 0.2, y: 0.75 }, painEvent: true, dialogue: "Eles estão olhando de volta!" },
            { type: 'curve', end: { x: 0.5, y: 0.2 }, control: { x: 0.25, y: 0.2 }, painEvent: true, dialogue: "NÃO! FECHE O OLHO!" }
        ],
        corruptionPoints: [
            { x: 0.5, y: 0.5, note: "O ponto focal deste sigilo é uma fenda, não uma lente. Ele não permite ver, ele permite ser visto por... algo do outro lado." },
            { x: 0.65, y: 0.25, note: "Esta curva canaliza a vontade do portador diretamente para a fenda, como um sacrifício. A perda de sanidade é inevitável e permanente." }
        ]
    },
};
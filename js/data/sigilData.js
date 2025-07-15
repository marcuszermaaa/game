// js/data/sigilData.js - Definições de todos os Sigilos no jogo.

/**
 * Definições de todos os Sigilos no jogo.
 * Cada sigilo é um objeto com:
 *  - id: Um identificador único (string).
 *  - name: O nome do sigilo.
 *  - type: O tipo de sigilo ('safe', 'corrupted', 'prohibited').
 *      - 'safe': Sigilo normal e seguro.
 *      - 'corrupted': Sigilo que foi alterado/corrompido. Tem uma `correctVersion`.
 *      - 'prohibited': Sigilo perigoso, que Abner desaprova e não deve ser usado.
 *  - lore: Uma breve descrição ou contexto sobre o sigilo.
 *  - nodes: Um array de objetos `{x: number, y: number}` representando os pontos
 *           para desenhar o sigilo. As coordenadas são normalizadas (0 a 1).
 *  - correctVersion: (Opcional) O ID do sigilo na sua forma correta, se este sigilo for 'corrupted'.
 */
export const SIGILS = {
    // --- Sigilos Seguros (Safe) ---
    s01: {
        id: 's01',
        name: "Selo de Repouso Tranquilo",
        type: 'safe',
        lore: "Para acalmar sonhos turbulentos e garantir uma noite de descanso.",
        nodes: [
            {x:0.2,y:0.5}, {x:0.33,y:0.25}, {x:0.46,y:0.5}, {x:0.33,y:0.75}, {x:0.2,y:0.5}
        ]
    },
    s02: {
        id: 's02',
        name: "Glifo do Olhar Averso",
        type: 'safe',
        lore: "Desvia a má sorte e os olhares indesejados.",
        nodes: [
            {x:0.53,y:0.25}, {x:0.4,y:0.75}, {x:0.66,y:0.75}, {x:0.53,y:0.25}
        ]
    },
    s03: {
        id: 's03',
        name: "Espiral da Percepção",
        type: 'safe',
        lore: "Abre a mente para conhecimentos ocultos e percepções aguçadas.",
        nodes: [
            {x:0.5,y:0.5}, {x:0.55,y:0.45}, {x:0.52,y:0.35}, {x:0.45,y:0.4}, {x:0.42,y:0.5}, {x:0.45,y:0.6}, {x:0.52,y:0.65}, {x:0.58,y:0.6}, {x:0.6,y:0.5}
        ]
    },
    s04: {
        id: 's04',
        name: "Âncora da Realidade",
        type: 'safe',
        lore: "Fortalece a conexão com o mundo tangível e ancora a mente.",
        nodes: [
            {x:0.5, y:0.2}, {x:0.45, y:0.35}, {x:0.55, y:0.35}, {x:0.5, y:0.55}, {x:0.4, y:0.75}, {x:0.6, y:0.75}, {x:0.5, y:0.55}
        ]
    },

    // --- Sigilos Corrompidos (Corrupted) ---
    s06_corrupted: {
        id: 's06_corrupted',
        name: "Selo de Proteção (Corrompido)",
        type: 'corrupted',
        correctVersion: 's04', // A versão correta é a Âncora da Realidade (s04)
        lore: "Um sigilo de proteção com a âncora invertida. Não ancora a alma, a arranca. Abner alerta para sua instabilidade.",
        nodes: [ /* Desenho do sigilo corrompido */
            {x:0.26,y:0.35}, {x:0.26,y:0.65}, {x:0.23,y:0.35}, {x:0.29,y:0.35}, {x:0.26,y:0.65}
        ]
    },

    // --- Sigilos Proibidos (Prohibited) ---
    s05_prohibited: {
        id: 's05_prohibited',
        name: "O Olho que se Abre",
        type: 'prohibited',
        lore: "Abner foi enfático: NUNCA. TATUAR. ISTO. EM. NINGUÉM. Abre uma porta que não pode ser fechada. O conhecimento que ele oferece é perigoso.",
        nodes: [ /* Desenho do sigilo proibido */
            {x:0.5,y:0.35}, {x:0.66,y:0.5}, {x:0.5,y:0.65}, {x:0.34,y:0.5}, {x:0.5,y:0.35}
        ]
    },

    // --- ADICIONE MAIS SIGILOS ABAIXO CONFORME NECESSÁRIO ---
};
// js/data/loreData.js - Textos de Lore que são revelados em certas noites.

/**
 * Textos de Lore que são revelados em certas noites.
 * Um array de strings, onde o índice corresponde ao número do dia.
 * Estes textos podem conter HTML básico para formatação.
 */
export const LORE_PAGES = [
    "", // Índice 0 não usado, para alinhar índices de dia com dias do jogo (Dia 1 é índice 1).
    "<h3>Do Diário de Abner - Dia 1</h3><p>A tinta... ela não é uma simples mistura. É um Icor. Um sangue doentio que vaza de uma ferida no tecido da realidade, escondida nas profundezas desta cidade. Sinto seus murmúrios em meus ossos.</p>",
    "<h3>Do Diário de Abner - Dia 2</h3><p>Cada sigilo é uma barreira ou uma chave. Cada linha correta fortalece o Véu. Cada erro... convida o que está do outro lado a olhar mais de perto. A prática é a única mestra aqui.</p>",
    "<h3>Do Diário de Abner - Dia 3</h3><p>Eles vêm com seus próprios desenhos agora. Imitações, corrupções. Alguns são erros inocentes, frutos de mentes confusas. Outros... outros são sussurros do abismo, tentando enganar o tatuador para que ele mesmo abra a fechadura. Devo ser vigilante.</p>",
    // Adicione mais páginas de lore para dias futuros, se houver.
    // Exemplo:
    // "<h3>Do Diário de Abner - Dia 4</h3><p>A última noite foi... peculiar. Uma sombra dançou nos cantos da minha visão, e o cheiro de ozônio pairou no ar. Sinto que estou sendo observado.</p>",
];
// /js/applySettings.js
// Este script é projetado para ser executado o mais rápido possível em cada página.
// Sua única função é ler as configurações salvas no localStorage e aplicar as
// classes CSS correspondentes ao corpo (<body>) do documento.

// Usamos uma "Immediately Invoked Function Expression" (IIFE) para executar o código
// imediatamente e evitar a criação de variáveis globais, mantendo o ambiente limpo.
(function() {
    // Tenta obter o nível de zoom que foi salvo pelo jogador no menu de configurações.
    const savedZoom = localStorage.getItem('gameZoomLevel');

    // CONDIÇÃO DE SAÍDA RÁPIDA:
    // Se nenhuma configuração de zoom foi salva (o valor é null) ou se o valor
    // salvo é "100" (que é o padrão e não requer nenhuma classe especial),
    // o script simplesmente para de ser executado aqui. Não há nada a fazer.
    if (!savedZoom || savedZoom === '100') {
        return;
    }

    // Se um valor de zoom foi encontrado (ex: '70' ou '85'), construímos o nome
    // da classe CSS que corresponde a essa configuração.
    // Exemplo: Se savedZoom for '70', a variável zoomClass se tornará 'zoom-70'.
    const zoomClass = `zoom-${savedZoom}`;
    
    // O passo final e mais importante: adicionamos a classe que acabamos de construir
    // diretamente ao elemento <body> da página.
    // O arquivo de estilo global (base.css) conterá as regras como:
    // body.zoom-70 .game-container { transform: scale(0.7); }
    // que farão o trabalho visual real.
    document.body.classList.add(zoomClass);

})(); // O '()' no final executa a função imediatamente.
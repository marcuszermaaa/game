// js/journal.js - Lógica para a página do Diário de Abner.

import { SIGILS } from './data/sigilData.js';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof SIGILS === 'undefined') {
        document.body.innerHTML = '<h1>ERRO CRÍTICO: Não foi possível carregar os dados dos sigilos.</h1>';
        console.error("ERRO CRÍTICO: SIGILS não está definido!");
        return;
    }
    
    let gameState = JSON.parse(localStorage.getItem('gameState'));
    if (!gameState) {
        console.error("Estado do jogo não encontrado! Redirecionando...");
        window.location.href = '/game.html';
        return;
    }

    const journalGrid = document.getElementById('journal-grid');
    if (!journalGrid) return;

    // Renderiza todos os sigilos no diário
    for (const sigilId in SIGILS) {
        const sigil = SIGILS[sigilId];
        const sigilCard = document.createElement('div');
        sigilCard.className = 'sigil-card';
        sigilCard.innerHTML = `
            <h3>${sigil.name}</h3>
            <canvas id="canvas-${sigil.id}" width="150" height="150"></canvas>
            <p class="sigil-lore">${sigil.lore}</p>
            <p class="sigil-type type-${sigil.type}">Tipo: ${sigil.type}</p>
        `;

        sigilCard.addEventListener('click', () => {
            console.log(`Sigilo selecionado: ${sigil.name} (${sigil.id})`);
            gameState.playerSigilChoice = sigil.id;
            
            // <<< MUDANÇA CRÍTICA AQUI >>>
            // Se o jogador estava no tutorial, preparamos o estado para a transição pós-tutorial.
            if (gameState.showingTutorial && gameState.tutorialStep === 'read_mail_then_diary') {
                console.log("Tutorial concluído! Preparando estado para a tela de início de dia...");
                gameState.showingTutorial = false;        // O modo tutorial acabou.
                gameState.tutorialStep = 'end_tutorial';  // Marca o passo como concluído.
                gameState.day = 1;                        // O jogo avança para o Dia 1.
                gameState.clientInDay = 0;                // Nenhum cliente foi atendido ainda.
                gameState.postTutorialSequence = true;    // ATIVA A FLAG para a tela de espera.
            }

            // Salva o estado ATUALIZADO e volta para a tela principal.
            localStorage.setItem('gameState', JSON.stringify(gameState));
            // A URL de retorno não precisa mais de parâmetros, pois o estado já contém tudo.
            window.location.href = '/game.html'; 
        });

        journalGrid.appendChild(sigilCard);

        const canvas = document.getElementById(`canvas-${sigil.id}`);
        if(canvas) {
            const ctx = canvas.getContext('2d');
            drawSigil(ctx, sigil.nodes, canvas.width, canvas.height);
        }
    }

    const backButton = document.getElementById('back-to-game-btn');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/game.html';
        });
    }
});

function drawSigil(ctx, nodes, width, height) {
    if (!nodes || nodes.length < 2) return;
    ctx.strokeStyle = '#f3d179';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * width, nodes[0].y * height);
    for (let i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x * width, nodes[i].y * height);
    }
    ctx.stroke();
}
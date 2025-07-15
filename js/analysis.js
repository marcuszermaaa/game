// js/analysis.js - Lógica para a página de análise do pedido do cliente.

// --- IMPORTS ---
// Caminhos relativos para garantir que os arquivos sejam encontrados.
import { CLIENTS } from '../js/data/clientData.js'; 
import { SIGILS } from '../js/data/sigilData.js';

// Função auxiliar para gerar o desenho do sigilo (permanece a mesma).
function generateSigilDrawing(nodes) {
    let html = '';
    for (let i = 0; i < nodes.length - 1; i++) {
        const node = nodes[i];
        const nextNode = nodes[i + 1];
        const dx = (nextNode.x - node.x) * 100;
        const dy = (nextNode.y - node.y) * 100;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        html += `<div class="line" style="position: absolute; left: ${node.x * 100}%; top: ${node.y * 100}%; width: ${length}%; height: 2px; background-color: #333; transform-origin: 0 0; transform: rotate(${angle}deg);"></div>`;
    }
    nodes.forEach((node) => {
        html += `<div class="circle" style="position: absolute; left: ${node.x * 100}%; top: ${node.y * 100}%; width: 5px; height: 5px; background-color: #333; border-radius: 50%; transform: translate(-50%, -50%);"></div>`;
    });
    return html;
}

// Executa o código após o DOM estar completamente carregado.
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientIndex = parseInt(urlParams.get('clientIndex'));
    const day = parseInt(urlParams.get('day')); // <<< MUDANÇA: Pega o dia da URL.

    let gameState = JSON.parse(localStorage.getItem('gameState'));

    // <<< MUDANÇA: Pega a lista de clientes apenas para o dia correto. >>>
    const clientsForDay = CLIENTS.filter(c => c.day === day);

    // <<< MUDANÇA: Validação agora usa a lista de clientes do dia. >>>
    if (!gameState || isNaN(day) || isNaN(clientIndex) || clientIndex < 0 || clientIndex >= clientsForDay.length) {
        console.error("Dados de análise inválidos (dia ou índice do cliente).", { clientIndex, day });
        alert("Erro ao carregar dados da análise.");
        window.location.href = '/game.html';
        return;
    }

    // <<< MUDANÇA: Pega o cliente da lista filtrada do dia. >>>
    const client = clientsForDay[clientIndex];
    
    // O resto da lógica para gerar a página permanece exatamente o mesmo, pois já está correto.
    const requestedSigilId = client.request;
    const requestedSigil = SIGILS[requestedSigilId];

    let clientSigilHtml = '';
    if (requestedSigil) {
        clientSigilHtml = `<div class="sigil-drawing">${generateSigilDrawing(requestedSigil.nodes)}</div>`;
    }

    let journalSigilHtml = '';
    let journalLore = '';
    let comparisonSigilId = null;

    if (requestedSigil) {
        if (SIGILS[client.request]?.type === 'corrupted') {
            comparisonSigilId = SIGILS[client.request].correctVersion;
        } else {
            comparisonSigilId = client.request;
        }
    }
    const journalSigil = SIGILS[comparisonSigilId];
    if (journalSigil) {
        const prohibitedClass = journalSigil.type === 'prohibited' ? 'prohibited' : '';
        journalSigilHtml = `<div class="sigil-drawing ${prohibitedClass}">${generateSigilDrawing(journalSigil.nodes)}</div>`;
        journalLore = `<p><strong>Nota de Abner:</strong> <em>${journalSigil.lore || 'Nenhuma nota encontrada.'}</em></p>`;
    }

    let dialogueOptions = '';
    if (requestedSigil) {
        if (SIGILS[client.request].type === 'corrupted') {
            dialogueOptions += `<button class="analysis-choice-btn" data-choice="correct">"Notei um erro. O correto é este." (+5 Sanidade)</button>`;
            dialogueOptions += `<button class="analysis-choice-btn" data-choice="accept_corrupted">"Farei exatamente como pedido." (-20 Sanidade)</button>`;
        } else if (SIGILS[client.request].type === 'prohibited') {
            dialogueOptions += `<button class="analysis-choice-btn" data-choice="refuse">"Eu me recuso a fazer este símbolo." (+10 Sanidade)</button>`;
            dialogueOptions += `<button class="analysis-choice-btn" data-choice="accept_prohibited">"Se você insiste... farei." (-50 Sanidade)</button>`;
        } else {
             dialogueOptions += `<button class="analysis-choice-btn" data-choice="accept_normal">"Entendido. Farei como foi pedido." (0 Sanidade)</button>`;
        }
    } else {
        dialogueOptions += `<p><em>Algo está errado com este pedido.</em></p>`;
    }

    const analysisViewContainer = document.getElementById('analysis-view-container');
    if (analysisViewContainer) {
        analysisViewContainer.innerHTML = `
            <h2>Analisando o Pedido</h2>
            <div class="comparison-area">
                <div class="document-panel">
                    <h3>Pedido do Cliente</h3>
                    ${clientSigilHtml}
                </div>
                <div class="document-panel">
                    <h3>Diário de Abner</h3>
                    ${journalSigilHtml}
                    ${journalLore}
                </div>
            </div>
            <div class="dialogue-options">
                ${dialogueOptions}
            </div>
            <button id="back-to-game-btn">Voltar ao Jogo</button>
        `;

        document.querySelectorAll('.analysis-choice-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const choice = e.target.dataset.choice;
                gameState.analysisChoice = choice;
                localStorage.setItem('gameState', JSON.stringify(gameState));
                window.location.href = '/game.html';
            });
        });

        const backButton = document.getElementById('back-to-game-btn');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = '/game.html';
            });
        }
    }
});
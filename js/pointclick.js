// /js/pointclick.js
import { PointClickManager } from './managers/pointclickmanager.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("===================================");
    console.log("▶️ INICIANDO MINIGAME POINT & CLICK");
    console.log("===================================");

    let gameState = JSON.parse(localStorage.getItem('gameState'));
    if (!gameState) {
        console.error("❌ FATAL: GameState não encontrado! O minigame não pode iniciar.");
        alert("Erro crítico: Não foi possível carregar os dados do jogo.");
        // Em um jogo real, redirecionaria. Aqui, vamos apenas parar.
        return;
    }
    console.log("✅ GameState principal carregado:", gameState);

    const onMinigameComplete = (result) => {
        console.log("===================================");
        console.log("🏁 MINIGAME CONCLUÍDO 🏁");
        console.log("===================================");
        console.log("Resultado a ser enviado de volta:", result);

        // A lógica de salvar e redirecionar permanece a mesma...
        gameState.pointClickResult = result;
        gameState.purchasedUpgrades = Array.from(new Set(gameState.purchasedUpgrades));
        gameState.readMailIds = Array.from(new Set(gameState.readMailIds));
        gameState.discoveredSigils = Array.from(new Set(gameState.discoveredSigils));
        localStorage.setItem('gameState', JSON.stringify(gameState));
        window.location.href = '/game.html';
    };

    console.log("🚀 Instanciando PointClickManager...");
    const engine = new PointClickManager(gameState, onMinigameComplete);
    console.log("⚙️ Iniciando a engine do minigame...");
    engine.start();
    
    // Expondo a engine na janela para depuração ao vivo
    window.pc_engine = engine;
    console.log("✨ Engine de Point & Click disponível no console como 'pc_engine'.");
});
// js/data/upgradeData.js - Definições de Upgrades que o jogador pode comprar.

export const UPGRADES = {
    // --- UPGRADE CONSUMÍVEL: TINTA ---
    refill_ink: {
        name: "Dose de Tinta Espectral",
        cost: 30, // Custo da tinta
        description: "Uma dose de tinta especial para mais uma tatuagem. Essencial para o trabalho.",
        iconUrl: "/media/icons/ink_refill_icon.png", // Crie um ícone para a loja
        effect: (gameInstance) => {
            // Este efeito é chamado quando o item é comprado.
            // A constante 3 deve ser substituída pela sua constante MAX_INK.
            if (gameInstance.state.inkCharges < 3) { 
                gameInstance.state.inkCharges++;
            }
        }
    },

    // --- UPGRADE CONSUMÍVEL: CAFÉ ---
    coffee: {
        name: "Café Forte",
        cost: 20,
        description: "Restaura 5 pontos de Sanidade. Um alívio momentâneo para uma mente cansada.",
        iconUrl: "/media/icons/coffee_icon.png", // Use o caminho correto para o ícone
        effect: (gameInstance) => {
            // Aplica o efeito imediato de restaurar sanidade.
            const sanityHeal = 5;
            gameInstance.state.sanity = Math.min(100, gameInstance.state.sanity + sanityHeal);
        }
    },

    // --- UPGRADES PERMANENTES ---
    lupa_analise: {
        name: "Lupa de Vidro Esfumaçado",
        cost: 70,
        iconUrl: "/media/icons/lupa_icon.png", // Use o caminho correto
        description: "Permite ver detalhes ocultos nos pedidos dos clientes. Pode revelar novas oportunidades.",
        effect: (gameInstance) => {
            // Upgrade passivo, o efeito é a sua existência no gameState.
            console.log("Efeito de 'Lupa de Vidro Esfumaçado' adquirido.");
        }
    },

    brace: {
        name: "Munhequeira de Couro",
        cost: 100,
        description: "Sua mão fica mais firme. Reduz o tremor durante o minigame em 25%.",
        iconUrl: "/media/icons/brace_icon.png", // Use o caminho correto
        effect: (gameInstance) => {
            // Efeito passivo que será lido pelo minigame.
            gameInstance.state.shakeMultiplier = (gameInstance.state.shakeMultiplier || 1.0) * 0.75;
            console.log("Efeito de 'Munhequeira de Couro' aplicado.");
        }
    },

    lamp: {
        name: "Lâmpada Mais Forte",
        cost: 60,
        iconUrl: "/media/icons/lamp_icon.png", // Use o caminho correto
        description: "Menos sombras, mente mais clara. Concede +1 de Sanidade extra ao final de cada tatuagem bem-sucedida.",
        effect: (gameInstance) => {
           // Efeito passivo que será lido no cálculo de recompensas.
           gameInstance.state.sanityPerClientBonus = (gameInstance.state.sanityPerClientBonus || 0) + 1;
           console.log("Efeito de 'Lâmpada Mais Forte' aplicado.");
        }
    }
};
// js/data/upgradeData.js - Definições de Upgrades que o jogador pode comprar.

/**
 * Definições de Upgrades que o jogador pode comprar na fase noturna.
 * Cada upgrade tem:
 *  - id (a chave do objeto): Um identificador único (ex: 'lupa_analise').
 *  - name: O nome do upgrade exibido na loja.
 *  - cost: O custo em dinheiro para comprar o upgrade.
 *  - description: Uma breve descrição do efeito do upgrade.
 *  - effect: (Opcional) Uma função que aplica uma MUDANÇA DE ESTADO IMEDIATA ao ser comprado.
 */
export const UPGRADES = {
    // --- LÓGICA CORRIGIDA E ADICIONADA ---
    lupa_analise: {
        name: "Lupa de Vidro Esfumaçado",
        cost: 70,
        description: "Permite ver detalhes ocultos nos pedidos dos clientes. Pode revelar novas oportunidades.",
        effect: (gameInstance) => {
            // Este é um upgrade "passivo". Sua principal função é existir no estado do jogo
            // para que outras partes do código (como o ClientManager) possam verificá-lo.
            // Não há uma mudança de estado imediata necessária aqui, mas podemos logar para confirmar.
            console.log("Efeito de 'Lupa de Vidro Esfumaçado' adquirido: Habilidade de análise aprimorada.");
        }
    },

    // --- Outros Upgrades ---
    coffee: {
        name: "Café Forte",
        cost: 20,
        description: "Restaura 5 pontos de Sanidade. Um alívio momentâneo para uma mente cansada.",
        effect: (gameInstance) => {
            // Este tem um efeito IMEDIATO.
            // O mockGameInstance em night.js tem uma função changeSanity que pode ser usada aqui.
            const mockSanityChanger = gameInstance.changeSanity || ((amount) => {
                gameInstance.state.sanity = Math.max(0, Math.min(100, gameInstance.state.sanity + amount));
            });
            mockSanityChanger(5);
            console.log("Efeito de 'Café Forte' aplicado: +5 Sanidade.");
        }
    },

    brace: {
        name: "Munhequeira de Couro",
        cost: 100,
        description: "Sua mão fica mais firme. Reduz o tremor durante o minigame em 25%.",
        effect: (gameInstance) => {
            // Modifica uma propriedade no estado do jogo que será usada pelo minigame.
            gameInstance.state.shakeMultiplier = (gameInstance.state.shakeMultiplier || 1.0) * 0.75;
            console.log("Efeito de 'Munhequeira de Couro' aplicado: Reduz tremor.");
        }
    },

    lamp: {
        name: "Lâmpada Mais Forte",
        cost: 60,
        description: "Menos sombras, mente mais clara. Concede +1 de Sanidade extra ao final de cada tatuagem bem-sucedida.",
        effect: (gameInstance) => {
           // Modifica uma propriedade que será usada no cálculo de recompensas.
           gameInstance.state.sanityPerClientBonus = (gameInstance.state.sanityPerClientBonus || 0) + 1;
           console.log("Efeito de 'Lâmpada Mais Forte' aplicado: +1 Sanidade bônus por sucesso.");
        }
    }
    // Adicione mais upgrades aqui conforme necessário.
};
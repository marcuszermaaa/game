// js/data/upgradeData.js - Definições de Upgrades que o jogador pode comprar.

/**
 * Definições de Upgrades que o jogador pode comprar na fase noturna.
 * Cada upgrade tem:
 *  - name: O nome do upgrade.
 *  - cost: O custo em dinheiro para comprar o upgrade.
 *  - description: Uma breve descrição do efeito do upgrade.
 *  - effect: Uma função que recebe a instância do GameManager (ou um objeto com acesso ao estado do jogo)
 *            e aplica as mudanças necessárias no estado do jogo.
 */
export const UPGRADES = {
    // --- Upgrades ---
    coffee: {
        name: "Café Forte",
        cost: 20,
        description: "+5 de Sanidade. Um alívio momentâneo.",
        effect: (gameInstance) => { // O efeito recebe a instância do GameManager.
            gameInstance.changeSanity(5); // Chama o método do GameManager para mudar a sanidade.
            console.log("Efeito de 'Café Forte' aplicado: +5 Sanidade.");
        }
    },
    brace: {
        name: "Munhequeira de Couro",
        cost: 100,
        description: "Reduz o tremor da mão em 25%.",
        effect: (gameInstance) => {
            // Modifica o multiplicador de tremedeira no estado do jogo.
            gameInstance.state.shakeMultiplier = (gameInstance.state.shakeMultiplier || 1.0) * 0.75;
            console.log("Efeito de 'Munhequeira de Couro' aplicado: Reduz tremor.");
        }
    },
    lamp: {
        name: "Lâmpada Mais Forte",
        cost: 60,
        description: "Menos sombras, mente mais clara. +1 de Sanidade por cliente.",
        effect: (gameInstance) => {
           // Aplica um bônus de sanidade que é adicionado por cliente.
           // Esse bônus pode ser somado ao valor base de sanidade ganho por cliente.
           gameInstance.state.sanityPerClient = (gameInstance.state.sanityPerClient || 0) + 1;
           console.log("Efeito de 'Lâmpada Mais Forte' aplicado: +1 Sanidade por cliente.");
        }
    }
    // Adicione mais upgrades aqui conforme necessário.
};
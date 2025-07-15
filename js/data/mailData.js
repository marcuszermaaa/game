// js/data/mailData.js - Contém as definições de todas as cartas (e-mails) que o jogador pode receber.

/**
 * Lista de Cartas (e-mails) que o jogador pode receber.
 * Cada carta é um objeto com:
 *  - id: Um identificador único (string).
 *  - sender: O nome ou entidade que enviou a carta.
 *  - subject: O assunto da carta.
 *  - content: O corpo da mensagem da carta. Pode conter quebras de linha (\n).
 *  - receivedDay: O dia do jogo em que a carta se torna disponível.
 */
export const MAILS = [
    {
        id: 'letter1', // ID único para a carta
        sender: 'Abner',
        subject: 'Um Encontro Estranho',
        content: 'Caro Tatuador,\n\nAlgo perturbador aconteceu. Sinto que as sombras estão se estendendo. Se você receber esta carta, significa que o Véu está mais fino do que eu esperava. Mantenha os olhos abertos. Os sigilos que você desenha... eles são mais do que apenas tinta.',
        receivedDay: 0, // Dia em que a carta se torna disponível
    },
    {
        id: 'letter2',
        sender: 'O Pescador Jonas',
        subject: 'Obrigado',
        content: 'O selo funcionou. Dormi pela primeira vez em semanas. Os sons do mar não me atormentam mais. Obrigado pela sua arte.',
        receivedDay: 1, // Esta carta também está disponível no Dia 1.
    },
    {
        id: 'letter3',
        sender: 'Arthur, o Estudante',
        subject: 'Um Pedido Urgente',
        content: 'Preciso da sua ajuda com um trabalho... As exigências são estranhas, mas a recompensa é alta. Ouvi dizer que você lida com o incomum.',
        receivedDay: 2, // Esta carta está disponível a partir do Dia 2.
    },
    {
        id: 'letter4',
        sender: 'Desconhecido',
        subject: 'Sussurros na Névoa',
        content: 'Eles dizem que a tinta tem memória. Que os símbolos que você cria ecoam nos planos inferiores. Cuidado com o que você evoca.',
        receivedDay: 2, // Disponível no Dia 2.
    },
    // --- ADICIONE MAIS CARTAS ABAIXO CONFORME NECESSÁRIO ---
];
// js/data/mailData.js - Contém as definições de todas as cartas (e-mails) que o jogador pode receber.
// Este arquivo funciona como um banco de dados para o conteúdo e a lógica associada a cada e-mail do jogo.

/**
 * @typedef {Object} MailAction
 * @property {string} type - O tipo de ação a ser executada (ex: 'add_money', 'change_sanity', 'unlock_client').
 * @property {any} payload - O valor ou dado associado à ação (ex: 15, -5, 'id_do_cliente').
 */

/**
 * @typedef {Object} Mail
 * @property {string} id - Um identificador único para a carta. Essencial para rastrear quais cartas foram lidas.
 * @property {string} sender - O nome ou entidade que enviou a carta.
 * @property {string} subject - O assunto da carta.
 * @property {string} content - O corpo da mensagem. Pode conter quebras de linha (\n), que serão convertidas para <br> na UI.
 * @property {number} receivedDay - O dia do jogo em que a carta se torna disponível para o jogador.
 * @property {MailAction} [action] - (Opcional) Uma ação que é acionada quando a carta é lida pela primeira vez.
 */

/**
 * @type {Mail[]}
 * Lista de Cartas (e-mails) que o jogador pode receber.
 */
export const MAILS = [
    // --- CARTA DO TUTORIAL ---
    {
        id: 'letter1',
        sender: 'Abner',
        senderId: 'abner',
        subject: 'Um Encontro Estranho',
        content: 'Caro Tatuador,\n\nAlgo perturbador aconteceu. Sinto que as sombras estão se estendendo. Se você receber esta carta, significa que o Véu está mais fino do que eu esperava. Mantenha os olhos abertos. Os sigilos que você desenha... eles são mais do que apenas tinta.',
        receivedDay: 1, // Recebida no início do Dia 1
    },

    // ✨ NOVO EMAIL AQUI ✨
    // --- EMAIL DO PROFESSOR (INÍCIO DO DIA 2) ---
    {
        id: 'armitage_sigil_discovery',
        sender: 'Prof. Armitage',
        senderId: 'prof_armitage',
        subject: 'Uma pequena descoberta',
        content: 'Elias,\n\nAnalisando as anotações de Abner que guardei, encontrei o esboço de outro sigilo que ele classificava como "seguro". Parece ser um tipo de proteção contra olhares indesejados. Estou lhe enviando uma cópia.\n\nSinto que estamos apenas na superfície de algo muito maior. Cada nova descoberta pode trazer tanto luz quanto sombras. Tenha cuidado.',
        receivedDay: 2, // Fica disponível no início do Dia 2
        
        // Ação especial que será executada ao ler o email
        action: {
            type: 'add_sigil',
            payload: 's02' // O ID do "Glifo do Olhar Averso"
        }
    },
    

    {
        id: 'letter4',
        sender: 'Desconhecido',
        subject: 'Sussurros na Névoa - ABRA COM CUIDADO',
        content: 'Eles dizem que a tinta tem memória. Que os símbolos que você cria ecoam nos planos inferiores. Cuidado com o que você evoca.',
        receivedDay: 2, // Uma carta misteriosa que chega no Dia 2 para aumentar a tensão.
        /**
         * AÇÃO: Afeta o estado do jogador.
         * Ler esta carta perturbadora causa uma pequena perda de sanidade.
         * Isso torna o mundo do jogo mais reativo e perigoso.
         */
        action: {
            type: 'change_sanity',
            payload: -5 // Um valor negativo para subtrair da sanidade do jogador.

        }


        

    }

    // --- ADICIONE MAIS CARTAS ABAIXO CONFORME NECESSÁRIO ---
    /*
    {
        id: 'letter5',
        sender: 'Sociedade de Preservação Histórica',
        subject: 'Doação de Itens Antigos',
        content: 'Prezado proprietário do antigo estúdio de Abner,\n\Encontramos alguns itens que pertenciam ao seu tio e gostaríamos de devolvê-los. Incluindo um conjunto de agulhas de prata peculiares.',
        receivedDay: 3,
        // Exemplo de uma futura ação que poderia dar um item ou upgrade.
        // action: {
        //     type: 'add_item',
        //     payload: 'agulhas_de_prata'
        // }
    },
    */
   ,{
        id: 'gift_from_gideon',
        sender: 'Gideon, o Artesão',
        // senderId: 'gideon_the_artisan', // Se você criar este cliente no futuro
        subject: 'Para mãos firmes',
        content: 'Tatuador,\n\nA sua arte me livrou de um tormento que paralisava minhas mãos. Eu não conseguia mais trabalhar. Agora, o tremor se foi. Como um gesto de minha imensa gratidão, envio-lhe esta munhequeira de couro que fiz. É o melhor trabalho que já realizei.\n\nQue suas mãos sejam sempre tão firmes quanto sua coragem.',
        receivedDay: 3, // Chega no Dia 3, por exemplo.
        /**
         * AÇÃO: Adiciona um UPGRADE diretamente ao inventário do jogador.
         * O 'payload' deve ser o ID exato do upgrade como definido em upgradeData.js.
         */
        action: {
            type: 'add_upgrade',
            payload: 'brace' // ID da "Munhequeira de Couro"
        }
    },
    // Adicione estes objetos ao array MAILS em mailData.js

    // ✨ CARTA DO DIA 4 ✨
    {
        id: 'kett_letter_1',
        sender: 'Kett, a Bibliotecária',
        subject: 'Uma preocupação... e um dever',
        content: 'Sr. Vance,\n\nMeu nome é Kett. Eu era uma colega de seu tio Abner e ex-aluna do Professor Armitage. Tenho notado a fixação recente do professor nos trabalhos de Abner na biblioteca, e isso me preocupa.\n\nAbner me confiou este fragmento, instruindo-me a entregá-lo a você quando sentisse que o momento era certo. Ele temia que alguém com menos escrúpulos o buscasse. Acredito que esse momento chegou.\n\nTenha cuidado. Armitage não é o estudioso benevolente que parece ser.',
        receivedDay: 4,
          action: {
            type: 'add_special_item',
            payload: 'sigil_fragment_2' // Correto: Kett entrega a 2ª parte
        }
    },

    // ✨ CARTA DO DIA 6 ✨
    {
        id: 'kett_letter_2',
        sender: 'Kett, a Bibliotecária',
        subject: 'A Verdadeira Busca de Abner',
        content: 'Elias,\n\nPreciso ser clara. Abner não estava pesquisando o sigilo de Astaroth para usá-lo. Ele o estudava para encontrar uma fraqueza, uma forma de contê-lo. Ele o chamava de "O Olho Cego".\n\nEle estava trabalhando em um contra-sigilo, um sigilo de banimento, mas temo que não tenha tido tempo de completá-lo. As promessas de poder de Armitage são uma armadilha. Não confie nele.',
        receivedDay: 6
        // Esta carta é puramente informativa, sem ação de jogo.
    },
];
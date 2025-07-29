// js/data/clientData.js

export const CLIENTS = [
   // ========================================================== //
   //                          DIA 1                             //
   // ========================================================== //
    {
       id: 'prof_armitage_intro',
       name: "Prof. Armitage",
       day: 1,
       portraitUrls: ["/media/img/professor.png"],
       problem: "Você deve ser Elias. Eu era um... colega do seu tio Abner. Ele me pediu para lhe entregar isto caso o pior acontecesse. Este livro contém algumas das respostas que ele encontrou. Estude-o. Você vai precisar.",
       isNarrativeEvent: true,
chronicleDescription: "Um colega acadêmico de Abner que parece saber mais do que revela. Suas intenções são um mistério, e sua ajuda parece sempre vir com um preço oculto."       
    },
    {
        id: 'arthur_estudante',
        name: "Arthur, o Estudante",
        day: 1,
        portraitUrls: ["/media/img/estudante.png", "/media/img/estudante_perdido.png"],
        problem: "A maré sobe em minha mente... sinto como se estivesse me afogando. Abner falou sobre algo para... para me prender à realidade. Por favor, me ajude.",
        correctSigil: 's04',
        chronicleDescription: "Um jovem estudante atormentado por visões do mar e uma aflição mental crescente. Ele busca nos sigilos um alívio para tormentos que mal consegue descrever.",
        successPay: 60, failPay: 0, wrongPay: 20,
    },
    {
        id: 'jonas_pescador',
        name: "Jonas, o Pescador",
        day: 1,
        portraitUrls: ["/media/img/pescador.png"],
        problem: "Não durmo. Cidades verdes afundadas... sinos guturais que não param. Abner disse que este selo acalma as águas da mente. Preciso de repouso.",
        correctSigil: 's01',
        successPay: 50, failPay: 0, wrongPay: 20,
        chronicleDescription: "Um pescador local assombrado por pesadelos de cidades submersas e o som de sinos abissais. Sua busca é por paz, um refúgio contra o que o mar lhe mostrou."
    },

   // ========================================================== //
   //                          DIA 2                             //
   // ========================================================== //
   {
       id: 'homem_apressado',
       name: "Um Homem Apressado",
       day: 2,
       portraitUrls: ["/media/img/p1_a.png", "/media/img/p1_b.png"],
       problem: "(O Homem Apressado, nervoso, estende um papel sujo.) Rápido! Não tenho tempo! Preciso deste símbolo. Proteção. Um velho marinheiro me deu o desenho. Pode fazê-lo agora?",
       request: 's06_corrupted',
       successPay: 100, failPay: 20, wrongPay: 40,
       chronicleDescription: "Um homem nervoso e impaciente que buscou sua ajuda com um sigilo corrompido. Sua pressa sugere que ele estava fugindo de algo... ou para algo."
    },
    {
        id: 'sra_pickman',
        name: "Sra. Pickman",
        day: 2,
        portraitUrls: ["/media/img/herdeira.png"],
        problem: "(A Sra. Pickman, fria, olha fixamente.) Meu rival prospera de forma antinatural. Abner me deu este glifo para desviar o mau-olhado. Preciso que a sorte dele seja 'adversa' à minha.",
        correctSigil: 's02',
        successPay: 80, failPay: 5, wrongPay: 25,
        chronicleDescription: "Uma herdeira fria e calculista de uma das famílias ricas de Port Blackwood, disposta a usar as artes arcanas para garantir seu sucesso nos negócios."
    },
        {
        id: 'colecionador_antiguidades',
        name: "Colecionador de Antiguidades",
        day: 2,
        portraitUrls: ["/media/img/collector.png"], // Você precisará de uma imagem para ele, ex: collector.png
        problem: "Eu lido com artefatos... peculiares. Minha mente às vezes se perde nos ecos que eles carregam. Abner me falou de uma espiral que ajuda a focar, a ver além do véu. Você pode recriá-la para mim?",
        correctSigil: 's03', // Espiral da Percepção
        successPay: 70, failPay: 10, wrongPay: 30,
        chronicleDescription: "Um negociante de artefatos raros e, muitas vezes, perturbadores. Sua mente parece tão sobrecarregada pelos ecos de sua coleção quanto suas prateleiras."
    },

   // ========================================================== //
   //                          DIA 3                             //
   // ========================================================== //
    // ========================================================== //
   //                          DIA 3                             //
   // ========================================================== //

    // <<< NOVO EVENTO NARRATIVO AQUI >>>
    // O Professor retorna para introduzir a mecânica de crafting.
    
   {
       id: 'prof_armitage_workbench_intro',
       name: "Prof. Armitage",
       day: 3,
       chronicleDescription: "Um colega acadêmico de Abner que parece saber mais do que revela. Suas intenções são um mistério, e sua ajuda parece sempre vir com um preço oculto."      , 

       // ✨ MUDANÇA 1: Definimos múltiplos retratos
       portraitUrls: [
           "./media/img/professor_neutral.png", // Retrato 0: Neutro
           "/media/img/professor_serious.png"  // Retrato 1: Sério
           // (Você precisará criar ou renomear suas imagens para corresponder)
       ], 
       isNarrativeEvent: true,

       // ✨ MUDANÇA 2: Substituímos 'problem' por 'narrativeSequence'
       narrativeSequence: [
           {
               text: "Elias, um avanço. Nos pertences de Abner, encontrei isto.",
               portraitIndex: 0 // Usa o retrato NEUTRO
           },
           {
               text: "(Ele lhe entrega um saquinho de couro úmido e pulsante). Ele o chamava de 'Bile de Profundo'.",
               portraitIndex: 0 // Ainda usa o retrato NEUTRO
           },
           {
               text: "Abner acreditava que a verdadeira tinta arcana não é encontrada, mas criada. Ele usava sua bancada de trabalho para isso. Talvez você devesse investigar.",
               portraitIndex: 1 // MUDA para o retrato SÉRIO
           }
       ],

       narrativeOutcomeText: "O Professor Armitage se despede, deixando o estranho ingrediente sobre o balcão. Você sente um impulso de investigar sua bancada de trabalho...",
       action: {
           type: 'add_ingredient',
           payload: 'bileDeProfundo'
       }
    },

      

    {
        id: 'sr_gilman',
        name: "Sr. Gilman",
        day: 3,
        portraitUrls: ["/media/img/estivador.png"],
        problem: "(Sr. Gilman, desconfiado, fala baixo.) Cais 7. Um contêiner de Innsmouth. Ouvi arranhões lá dentro. Abner me deu uma âncora para me manter firme. Preciso dela para o meu turno hoje à noite.",
        correctSigil: 's04',
        successPay: 60, failPay: 10, wrongPay: 25,
        chronicleDescription: "Um estivador desconfiado que trabalha nos cais. Ele vê e ouve coisas que não deveria, e confia na força dos sigilos de Abner para se manter são."
    },
        {
        id: 'cultista_desesperado',
        name: "Figura Encapuzada",
        day: 3,
        portraitUrls: ["/media/img/hooded_figure.png"], // Necessário criar uma imagem
        problem: "(A figura sussurra, o rosto oculto nas sombras.) O mestre chama. Preciso de uma passagem, um olho que se abre para o outro lado. Sei que Abner conhecia este símbolo. O preço não é problema.",
        request: 's05_prohibited', // O Olho que se Abre, um sigilo PROIBIDO
        successPay: 300, failPay: 50, wrongPay: 100, // Pagamentos altos para um risco alto
        chronicleDescription: "Uma figura misteriosa e devota de um poder sombrio. Sua busca pelo sigilo proibido representa a tentação mais perigosa que você já enfrentou."
    },


// Adicione este bloco inteiro dentro do array CLIENTS em clientData.js

    // ========================================================== //
    //                          DIA 4                             //
    // ========================================================== //
    {
       id: 'zadok_allen_intro',
       name: "Zadok Allen",
       day: 4,
       portraitUrls: ["/media/img/mendigo.png"], // Você precisará criar a imagem mendigo.png
       isNarrativeEvent: true,
       chronicleDescription: "Um velho bêbado de Innsmouth que conhecia Abner. Seus delírios etílicos frequentemente contêm fragmentos de verdades terríveis sobre os segredos da cidade.",
       narrativeSequence: [
           {
               text: "(Um homem velho, cheirando a maresia e álcool, tropeça para dentro). Você... você tem o olhar dele. O olhar de Abner.",
               portraitIndex: 0
           },
           {
               text: "O velho Abner... ele sabia dos segredos. Segredos que o mar quer manter. Ele temia o olho... o olho que não pisca. Ele o escondeu, ele o quebrou...",
               portraitIndex: 0
           }
       ],

       narrativeOutcomeText: "O velho resmunga algo ininteligível e sai cambaleando, deixando para trás apenas o cheiro de sal e mistério.",
       // Sem ação de jogo, apenas uma pista narrativa.
    },

    // ========================================================== //
    //                          DIA 5                             //
    // ========================================================== //
    {
       id: 'armitage_pressure',
       name: "Prof. Armitage",
       day: 5,
       chronicleDescription: "Um colega acadêmico de Abner que parece saber mais do que revela. Suas intenções são um mistério, e sua ajuda parece sempre vir com um preço oculto."       ,

       portraitUrls: [
           "/media/img/professor.png",
           "/media/img/professor_serious.png"
       ], 
       isNarrativeEvent: true,

       narrativeSequence: [
           {
               text: "Elias, que bom vê-lo. Tenho feito um progresso extraordinário. Estamos perto de desbloquear um conhecimento que Abner apenas sonhava em alcançar.",
               portraitIndex: 0
           },
           {
               text: "Para isso, precisaremos de um... conduíte. Um sigilo de grande poder. Encontrei outra peça do quebra-cabeça. Guarde-a bem.",
               portraitIndex: 1
           }
       ],

       narrativeOutcomeText: "Ele lhe entrega um pergaminho enrolado. A urgência em seus olhos é inegável. Ele parece estar se impacientando.",
       action: {
           type: 'add_special_item',
           payload: 'sigil_fragment_1' // Primeira parte, entregue por Armitage
       }
    },
// Adicione este bloco dentro do array CLIENTS em clientData.js

    // ========================================================== //
    //                          DIA 6                             //
    // ========================================================== //
    {
       id: 'kett_warning_event',
       name: "Uma Carta Urgente",
       day: 6,
       portraitUrls: ["/media/img/icons/kett_letter_icon.png"], // Crie um ícone para uma carta, ou reutilize um existente
       isNarrativeEvent: true,
       // Este evento não tem diálogo falado, ele representa o recebimento da carta.
       narrativeSequence: [
           {
               text: "Enquanto você limpa o balcão, uma carta selada com o sinete da biblioteca desliza por debaixo da porta. É de Kett, e o tom da escrita é urgente.",
               portraitIndex: 0
           }
       ],

       narrativeOutcomeText: "As palavras de Kett confirmam suas suspeitas. A busca de Abner não era por poder, mas por uma forma de defesa. A desconfiança em Armitage se solidifica em uma certeza perigosa.",
       // A carta em si (em mailData.js) é puramente informativa, então não há ação aqui.
       // Este evento serve para preencher o dia e dar tempo ao jogador para ler o e-mail.
    },
    // ========================================================== //
    //                          DIA 7                             //
    // ========================================================== //
    // ✨ SUGESTÃO IMPLEMENTADA: O ACÓLITO DE ARMITAGE ✨
   // Adicione/modifique este evento no array CLIENTS em clientData.js para o Dia 7

    // ========================================================== //
    //                          DIA 7                             //
    // ========================================================== //
    {
       id: 'zadok_allen_return',
       name: "Zadok Allen",
       day: 7,
       portraitUrls: ["/media/img/mendigo.png"],
       isNarrativeEvent: true,
chronicleDescription: "Um velho bêbado de Innsmouth que conhecia Abner. Seus delírios etílicos frequentemente contêm fragmentos de verdades terríveis.",
       narrativeSequence: [
           {
               text: "(Zadok o agarra pelo braço, seus olhos estranhamente lúcidos por um momento). Ele escondeu o olho... mas não o que o olho via!",
               portraitIndex: 0
           },
           {
               text: "(Ele pressiona um objeto frio e quebrado em sua mão). Abner usava isso... para ver as costuras. As costuras da realidade! Cuidado com o professor... ele quer rasgá-las!",
               portraitIndex: 0
           }
       ],

       narrativeOutcomeText: "Tão rápido quanto apareceu, Zadok se vai, deixando-o com a lente quebrada e um aviso arrepiante.",
       
       // ✨ AÇÃO CORRIGIDA ✨
       // Agora, Zadok entrega a lente quebrada.
       action: {
           type: 'add_special_item',
           payload: 'broken_lens'
       }
    },

    {
        id: 'olho_ansioso',
        name: "O Olho Ansioso",
        day: 7,
        portraitUrls: ["/media/img/estudioso_palido.png"], // Você precisará criar a imagem
        problem: "O mestre... o Professor Armitage... disse que você poderia me ajudar. Preciso ver. Ver além do que me é mostrado. Ele mencionou uma espiral...",
        correctSigil: 's03', // Espiral da Percepção
        successPay: 70, failPay: 10, wrongPay: 30,
        chronicleDescription: "Um estudioso pálido e seguidor do Professor Armitage. Sua ânsia por 'ver além' revela a perigosa influência que o professor exerce sobre mentes curiosas."
    },
    
    // ✨ SUGESTÃO IMPLEMENTADA: A VÍTIMA ✨
    {
        id: 'vitima_armitage',
        name: "Pescador Adoentado",
        day: 7,
        portraitUrls: ["/media/img/pescador_doente.png"], // Você precisará criar a imagem
        isNarrativeEvent: true,
        chronicleDescription: "Um dos habitantes locais que foi enganado por Armitage, sofrendo as consequências de uma tatuagem corrompida. Sua agonia é um testemunho sombrio da imprudência do professor.",
        // Este evento usará um callback especial para mostrar um painel de escolha
        narrativeSequence: [
           {
               text: "(O homem mostra o braço, onde uma tatuagem borrada e avermelhada infecciona a pele). Foi o Professor... ele disse que me protegeria dos pesadelos. Mas agora... agora eles vêm mesmo quando estou acordado!",
               portraitIndex: 0
           }
        ],
        // Não precisamos de narrativeOutcomeText porque a escolha do jogador será o resultado.
        // A ação será tratada pelo GameManager.
    },


];

// ========================================================== //
//                    EVENTOS CONDICIONAIS                    //
// ========================================================== //
// Estes "clientes" só aparecem se as condições de gatilho forem atendidas

export const CONDITIONAL_CLIENTS = [
    {
        id: 'arthur_retorno_sangue', // ID único para este evento
        trigger: { // Condições para este evento acontecer
            clientId: 'arthur_estudante', // Precisa ser o Arthur do Dia 1
            method: 'blood',              // A tatuagem dele precisa ter sido feita com sangue
            minDay: 4,                    // Ele só pode retornar a partir do Dia 4
        },
        // Dados normais do cliente
        name: "Arthur, o Estudante...?",
        day: 4, // O dia em que ele pode aparecer
        portraitUrls: ["/media/img/estudante_corrompido.png"], // Uma nova imagem, mais perturbadora
        problem: "A âncora... ela não me prendeu... ela me PUXOU. O sangue que você usou... ele canta para o que está lá embaixo. Você precisa consertar isso!",
        isNarrativeEvent: true // Ou pode levar a um novo minigame de "remoção"
    },
    {
        id: 'jonas_dispensado_retorno',
        trigger: {
            clientId: 'jonas_pescador',
            outcome: 'dispensed_no_ink', // Um novo 'outcome' que definiremos
            minDay: 3,
        },
        name: "Jonas, o Pescador",
        day: 3,
        portraitUrls: ["/media/img/pescador.png"],
        problem: "Eu voltei. Conseguiu arranjar mais tinta? Os sinos... eles estão mais altos. Por favor, eu pago o dobro.",
        correctSigil: 's01', // Ele pede a mesma coisa
        successPay: 100, // Pagando o dobro
        failPay: 0, wrongPay: 20,
    }
];
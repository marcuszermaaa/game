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
       isNarrativeEvent: true
    },
    {
        id: 'arthur_estudante',
        name: "Arthur, o Estudante",
        day: 1,
        portraitUrls: ["/media/img/estudante.png", "/media/img/estudante_perdido.png"],
        problem: "A maré sobe em minha mente... sinto como se estivesse me afogando. Abner falou sobre algo para... para me prender à realidade. Por favor, me ajude.",
        correctSigil: 's04',
        successPay: 40, failPay: 0, wrongPay: 20,
    },
    {
        id: 'jonas_pescador',
        name: "Jonas, o Pescador",
        day: 1,
        portraitUrls: ["/media/img/pescador.png"],
        problem: "Não durmo. Cidades verdes afundadas... sinos guturais que não param. Abner disse que este selo acalma as águas da mente. Preciso de repouso.",
        correctSigil: 's01',
        successPay: 50, failPay: 0, wrongPay: 20,
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
    },
    {
        id: 'sra_pickman',
        name: "Sra. Pickman",
        day: 2,
        portraitUrls: ["/media/img/herdeira.png"],
        problem: "(A Sra. Pickman, fria, olha fixamente.) Meu rival prospera de forma antinatural. Abner me deu este glifo para desviar o mau-olhado. Preciso que a sorte dele seja 'adversa' à minha.",
        correctSigil: 's02',
        successPay: 80, failPay: 5, wrongPay: 25,
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
       portraitUrls: ["/media/img/professor.png"],
       problem: "Elias, um avanço. Nos pertences de Abner, encontrei isto. (Ele lhe entrega um saquinho de couro úmido e pulsante). Ele o chamava de 'Bile de Profundo'. Abner acreditava que a verdadeira tinta arcana não é encontrada, mas criada. Ele usava sua bancada de trabalho para isso. Talvez você devesse investigar.",
       isNarrativeEvent: true,
       // Ação especial que o GameManager irá processar.
       action: {
           type: 'add_ingredient',
           payload: 'bileDeProfundo' // Um ID único para o novo ingrediente
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
    },
];
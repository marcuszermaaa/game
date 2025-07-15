// js/data/clientData.js - Definições de todos os clientes que aparecem no jogo.

export const CLIENTS = [
   // --- DIA 1 ---
    {
        id: 'homem_apressado',
        name: "Um Homem Apressado",
        day: 1, // <<< MUDANÇA: 'chapter' foi renomeado para 'day'
        portraitUrls: ["/media/img/p1_a.png", "/media/img/p1_b.png"],
        problem: "(O Homem Apressado, nervoso, estende um papel sujo.)\nRápido! Não tenho tempo! Preciso deste símbolo. Proteção. Um velho marinheiro me deu o desenho. Pode fazê-lo agora?",
        request: 's06_corrupted',
        successPay: 100, failPay: 20, wrongPay: 40,
    },
    {
        id: 'arthur_estudante',
        name: "Arthur, o Estudante",
        day: 1, // <<< MUDANÇA
        portraitUrls: ["/media/img/estudante.png", "/media/img/estudante_perdido.png"],
        problem: "(Arthur estende o braço, o desenho de uma âncora trêmulo.)\nA maré sobe em minha mente. Abner começou esta âncora para me prender à realidade, mas as linhas estão fracas. Por favor, complete-a.",
        correctSigil: 's04',
        successPay: 40, failPay: 0, wrongPay: 20,
    },
    {
        id: 'jonas_pescador',
        name: "Jonas, o Pescador",
        day: 1, // <<< MUDANÇA
        portraitUrls: ["/media/img/pescador.png"],
        problem: "(Jonas, abatido, esfrega as têmporas.)\nNão durmo. Cidades verdes afundadas... sinos guturais que não param. Abner disse que este selo acalma as águas da mente. Preciso de repouso.",
        correctSigil: 's01',
        successPay: 50, failPay: 0, wrongPay: 20,
    },

   // --- DIA 2 ---
    {
        id: 'prof_armitage',
        name: "Prof. Armitage",
        day: 2, // <<< MUDANÇA
        portraitUrls: ["/media/img/professor.png"],
        problem: "(O Professor Armitage abre um volume antigo.)\nEstou à beira de uma descoberta, mas uma névoa me impede de ver além. Abner falou desta espiral para alinhar a mente com verdades ocultas. Pode reproduzi-la?",
        correctSigil: 's03',
        successPay: 70, failPay: 10, wrongPay: 30,
    },
    {
        id: 'sra_pickman',
        name: "Sra. Pickman",
        day: 2, // <<< MUDANÇA
        portraitUrls: ["/media/img/herdeira.png"],
        problem: "(A Sra. Pickman, fria, olha fixamente.)\nMeu rival prospera de forma antinatural. Abner me deu este glifo para desviar o mau-olhado. Preciso que a sorte dele seja 'adversa' à minha.",
        correctSigil: 's02',
        successPay: 80, failPay: 5, wrongPay: 25,
    },
    {
        id: 'sr_gilman',
        name: "Sr. Gilman",
        day: 2, // <<< MUDANÇA
        portraitUrls: ["/media/img/estivador.png"],
        problem: "(Sr. Gilman, desconfiado, fala baixo.)\nCais 7. Um contêiner de Innsmouth. Ouvi arranhões lá dentro. Abner me deu uma âncora para me manter firme. Preciso dela para o meu turno hoje à noite.",
        correctSigil: 's04',
        successPay: 60, failPay: 10, wrongPay: 25,
    },
];
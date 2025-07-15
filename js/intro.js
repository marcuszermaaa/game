// intro.js - Lógica para a tela de introdução do jogo.

// --- Elementos da UI ---
const introTitle = document.getElementById('introTitle');
const splashContainer = document.getElementById('splashContainer');
const textOverlay = document.getElementById('textOverlay');
const textContent = document.getElementById('textContent');
const continueButton = document.getElementById('continueButton'); // Imagem de continuar
const openDoorsButton = document.getElementById('openDoorsButton'); // Botão final para iniciar o jogo
// const startAdventureBtn = document.getElementById('start-adventure-btn'); // REMOVIDO
const skipIntroBtn = document.getElementById('skip-intro-btn'); // Botão para pular toda a intro

// --- Dados da Introdução ---
const introSplashes = [
    {
        imageClass: 'splash-1',
        text: "A vida de Elias Vance sempre foi uma sombra. Marcado pelo azar, ele vivia à margem, até que a notícia inesperada de seu distante tio-avô, Abner, um homem que ele mal compreendia, o alcançou. Abner estava morto. A herança: um estúdio de tatuagens em Port Blackwood, uma cidade distante e misteriosa que Elias nunca ouvira falar."
    },
    {
        imageClass: 'splash-2',
        text: "Com a chave do estúdio, veio uma carta fria. 'Melhores explicações' o aguardavam lá. Nela, a caligrafia de Abner, estranhamente familiar, dizia: '*Sempre procurei a beleza, Elias, mas a beleza nem sempre é o que imaginamos*.' Elias hesitou. A cidade, em seu nome e fama, trazia à tona memórias perturbadoras de Abner. As histórias sussurradas sobre sua obsessão por símbolos obscuros e criaturas marinhas... Parecia que a cidade era o reflexo sombrio das coisas que sempre o assustaram em seu próprio tio, e um eco distante, quase um sussurro, parecia vir das profundezas daquela herança obscura."
    },
    {
        imageClass: 'splash-3',
        text: "As contas, no entanto, não paravam de se acumular, uma pressão real sobre a vida à margem. A herança era sua única saída. A única esperança de uma vida que não fosse marcada pelo fracasso. Um porto seguro, talvez. Uma razão para arriscar tudo e buscar as 'melhores explicações' que o aguardavam."
    },
    {
        imageClass: 'splash-4',
        text: "Com o destino e a sanidade em jogo, Elias não teve escolha. Ele fez a viagem. Os navios atracavam e os prédios decadentes surgiam entre a névoa, exatamente como os livros estranhos que Abner colecionava, uma cópia perfeita do pesadelo. Ele segurou a chave, o único elo com seu futuro incerto. Era hora de abrir o estúdio."
    }
];

let currentSplashIndex = 0;
let charIndex = 0;
let typingTimeout;
const typingSpeed = 50; // ms por caractere
let isTyping = false; // Flag para controlar se a digitação está em andamento

// --- Funções de Controle ---

function showSplash(index) {
    if (introTitle.classList.contains('active')) {
        introTitle.classList.remove('active');
        introTitle.style.opacity = '0';
    }

    splashContainer.innerHTML = '';
    const imgElement = document.createElement('div');
    imgElement.classList.add('splash-image', introSplashes[index].imageClass);
    splashContainer.appendChild(imgElement);

    setTimeout(() => {
        imgElement.classList.add('active');
        startTextTyping(introSplashes[index].text);
    }, 100);
}

function startTextTyping(text) {
    clearTimeout(typingTimeout);
    textContent.innerHTML = '';
    charIndex = 0;
    textOverlay.classList.add('active');
    continueButton.style.display = 'none';
    openDoorsButton.style.display = 'none';
    // startAdventureBtn.style.display = 'none'; // REMOVIDO
    skipIntroBtn.style.display = 'block';
    isTyping = true;
    
    typeCharacter(text);
}

function typeCharacter(text) {
    if (charIndex < text.length) {
        textContent.innerHTML += text.charAt(charIndex);
        charIndex++;
        typingTimeout = setTimeout(() => typeCharacter(text), typingSpeed);
    } else {
        textContent.innerHTML += '<span class="cursor"></span>';
        isTyping = false;
        
        continueButton.style.display = 'block'; 
        openDoorsButton.style.display = 'none'; 
        // startAdventureBtn.style.display = 'none'; // REMOVIDO
    }
}

function skipToIntroEnd() {
    clearTimeout(typingTimeout);
    isTyping = false;

    currentSplashIndex = introSplashes.length;

    finishIntroSequence();
}

function finishIntroSequence() {
    textOverlay.classList.remove('active');
    
    splashContainer.innerHTML = '';
    const finalImgElement = document.createElement('div');
    finalImgElement.classList.add('splash-image', 'splash-final'); 
    splashContainer.appendChild(finalImgElement);
    
    setTimeout(() => {
        finalImgElement.classList.add('active');
        finalImgElement.style.transition = 'opacity 3s ease-in-out, transform 10s linear';
    }, 100);

    setTimeout(() => {
        textContent.innerHTML = "O Véu se ergue... <br> A jornada começa agora.";
        continueButton.style.display = 'none';
        openDoorsButton.style.display = 'block'; // Apenas este botão agora
        // startAdventureBtn.style.display = 'none'; // REMOVIDO
        skipIntroBtn.style.display = 'none';
        
        textOverlay.classList.add('active');
        textOverlay.style.textAlign = 'center';
        textContent.style.fontSize = '1.8em';
    }, 3000);
}

function nextSplash() {
    clearTimeout(typingTimeout);
    isTyping = false;

    currentSplashIndex++;

    if (currentSplashIndex < introSplashes.length) {
        textOverlay.classList.remove('active');
        setTimeout(() => {
            showSplash(currentSplashIndex);
        }, 1500);
    } else {
        finishIntroSequence();
    }
}

// --- Event Listeners ---

continueButton.addEventListener('click', () => {
    if (!isTyping && continueButton.style.display === 'block') {
        nextSplash();
    }
});

openDoorsButton.addEventListener('click', () => {
    window.location.href = '/game.html';
});

/*
startAdventureBtn.addEventListener('click', () => { // REMOVIDO
    window.location.href = '/game.html';
});
*/

skipIntroBtn.addEventListener('click', () => {
    skipToIntroEnd();
});

document.addEventListener('keydown', (e) => {
    // Se apenas o botão "Abrir a Porta" estiver visível
    if (openDoorsButton.style.display === 'block') {
        openDoorsButton.click(); 
        return;
    }

    if (isTyping) {
        clearTimeout(typingTimeout);
        textContent.innerHTML = introSplashes[currentSplashIndex].text;
        textContent.innerHTML += '<span class="cursor"></span>';
        continueButton.style.display = 'block';
        isTyping = false;
    }
    else if (!isTyping && continueButton.style.display === 'block') {
        nextSplash();
    }
});

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    introTitle.classList.add('active');
    setTimeout(() => {
        showSplash(currentSplashIndex);
    }, 2000);
});
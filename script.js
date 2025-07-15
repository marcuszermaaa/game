//--- CONSTANTS & DATA ---

const IS_TOUCH_DEVICE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const SIGILS = {
    s01: { name: "Selo de Repouso Tranquilo", type: 'safe', lore: "Para acalmar sonhos turbulentos.", nodes: [{x:0.2,y:0.5}, {x:0.33,y:0.25}, {x:0.46,y:0.5}, {x:0.33,y:0.75}, {x:0.2,y:0.5}] },
    s02: { name: "Glifo do Olhar Averso", type: 'safe', lore: "Desvia a má sorte.", nodes: [{x:0.53,y:0.25}, {x:0.4,y:0.75}, {x:0.66,y:0.75}, {x:0.53,y:0.25}] },
    s03: { name: "Espiral da Percepção", type: 'safe', lore: "Abre a mente para conhecimentos ocultos.", nodes: [{x:0.5,y:0.5}, {x:0.55,y:0.45}, {x:0.52,y:0.35}, {x:0.45,y:0.4}, {x:0.42,y:0.5}, {x:0.45,y:0.6}, {x:0.52,y:0.65}, {x:0.58,y:0.6}, {x:0.6,y:0.5}] },
    s04: {
        name: "Âncora da Realidade",
        type: 'safe',
        lore: "Fortalece a conexão com o mundo tangível.",
        nodes: [
            {x:0.5, y:0.2},   /*/ 1. Topo da haste
            {x:0.45, y:0.35}, /*/ 2. Esquerda do olhal
            {x:0.55, y:0.35}, /*/ 3. Direita do olhal
            {x:0.5, y:0.55},  /*/ 4. Base da haste
            {x:0.4, y:0.75},  /*/ 5. Garra esquerda inferior
            {x:0.6, y:0.75},  /*/ 6. Garra direita inferior
            {x:0.5, y:0.55}   /*/ 7. Retorna à base da haste para fechar o traçado
        ]
    },
    s05_prohibited: { name: "O Olho que se Abre", type: 'prohibited', lore: "NUNCA. TATUAR. ISTO. EM. NINGUÉM. Abre uma porta que não pode ser fechada.", nodes: [{x:0.5,y:0.35}, {x:0.66,y:0.5}, {x:0.5,y:0.65}, {x:0.34,y:0.5}, {x:0.5,y:0.35}] },
    s06_corrupted: { name: "Selo de Proteção (Corrompido)", type: 'corrupted', correctVersion: 's04', lore: "Um sigilo de proteção com a âncora invertida. Não ancora a alma, a arranca.", nodes: [{x:0.26,y:0.35}, {x:0.26,y:0.65}, {x:0.23,y:0.35}, {x:0.29,y:0.35}, {x:0.26,y:0.65}] },
};
const CLIENTS = [
    {
        name: "Arthur, o Estudante",
        portraitUrl: "media/estudante.jpg",/*/ Certifique-se que esta imagem é a desejada
        problem: "(Arthur estende o braço, o desenho da âncora trêmulo, os olhos distantes.)\nA maré sobe em minha mente. Os murmúrios das profundezas... Abner começou esta âncora para me prender à realidade. As linhas estão fracas, quase invisíveis. Por favor, complete-a. Fortaleça-a. Preciso do peso da terra sob meus pés novamente, antes que a correnteza me leve.",
        correctSigil: 's04', successPay: 40, failPay: 0, wrongPay: 20
    },
    {
        name: "Jonas, o Pescador",
        portraitUrl: "media/pescador.JPG",
        problem: "(Jonas, abatido e com olheiras, esfrega as têmporas.)\nNão durmo. Cidades verdes afundadas... sinos guturais que não param, vindo das profundezas. Abner disse que este selo acalma as águas turbulentas da mente. Preciso que os monstros da noite se afastem. Preciso desse repouso.",
        correctSigil: 's01', successPay: 50, failPay: 0, wrongPay: 20
    },
    {
        name: "Prof. Armitage",
        portraitUrl: "media/professor.JPG",
        problem: "(O Professor Armitage abre um volume antigo com um sorriso enigmático.)\nEncontrei um texto sobre a percepção. Estou à beira de uma descoberta que pode mudar tudo. Mas uma névoa me impede de ver o que há além. Abner falou desta espiral para alinhar a mente com verdades ocultas. Pode reproduzi-la, aprimorando minha tentativa?",
        correctSigil: 's03', successPay: 70, failPay: 10, wrongPay: 30
    },
    {
        name: "Sra. Pickman",
        portraitUrl: "./media/herdeira.JPG",
        problem: "(A Sra. Pickman, fria e calculista, olha fixamente.)\nMeu rival prospera de forma antinatural. Seus negócios florescem como se uma aura o protegesse. Abner me deu este glifo para desviar o mau-olhado. Preciso que a sorte dele seja 'averso' à minha necessidade. Pode direcioná-lo?",
        correctSigil: 's02', successPay: 80, failPay: 5, wrongPay: 25
    },
    {
        name: "Sr. Gilman",
        portraitUrl: "./media/estivador.JPG",
        problem: "(Sr. Gilman, corpulento e desconfiado, fala baixo, olhando ao redor.)\nCais 7. Um contêiner de Innsmouth. Ouvi arranhões pesados lá dentro. Algo que não devia estar solto. Abner me deu uma âncora para me manter firme quando a noite traz as marés. Preciso dela para o meu turno hoje à noite.",
        correctSigil: 's04', successPay: 60, failPay: 10, wrongPay: 25
    },
    {
        name: "Um Homem Apressado",
        portraitUrl: "./media/estudante.png",/*/ Imagem de exemplo, pois não há imagem específica.
        problem: "(O Homem Apressado, nervoso e suando, estende um papel sujo.)\nRápido! Não tenho tempo! Preciso deste símbolo. Proteção. Um velho marinheiro me deu o desenho. Ele disse que era o único que funcionaria. Pode fazê-lo agora? Não posso voltar sem ele.",
        request: 's06_corrupted', successPay: 100, failPay: 20, wrongPay: 40
    },
];
const LORE_PAGES = [
    "",/*/ Página 0 não utilizada
    "<h3>Do Diário de Abner - Página 1</h3><p>A tinta... ela não é uma simples mistura. É um Icor. Um sangue doentio que vaza de uma ferida no tecido da realidade, escondida nas profundezas desta cidade.</p>",
    "<h3>Do Diário de Abner - Página 2</h3><p>Cada sigilo é uma barreira ou uma chave. Cada linha correta fortalece o Véu. Cada erro... convida o que está do outro lado a olhar mais de perto.</p>",
    "<h3>Do Diário de Abner - Página 3</h3><p>Eles vêm com seus próprios desenhos agora. Imitações, corrupções. Alguns são erros inocentes. Outros... outros são sussurros do abismo, tentando enganar o tatuador para que ele mesmo abra a fechadura. Devo ser vigilante.</p>"
];
const UPGRADES = {
    coffee: { name: "Café Forte", cost: 20, description: "+5 de Sanidade. Um alívio momentâneo.", effect: (game) => game.changeSanity(5) },
    brace: { name: "Munhequeira de Couro", cost: 100, description: "Reduz o tremor da mão em 25%.", effect: (game) => { game.state.shakeMultiplier *= 0.75; } },
    lamp: { name: "Lâmpada Mais Forte", cost: 60, description: "Menos sombras, mente mais clara. +1 de Sanidade por cliente.", effect: (game) => { game.state.sanityPerClient += 1; } }
};

//--- CLASSES DO JOGO ---
class TattooMinigame {
    constructor(canvas, sigil, gameState, onComplete) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.sigil = sigil;
        this.gameState = gameState;
        this.onComplete = onComplete;
        this.targetNodes = this.sigil.nodes.map(node => ({ ...node, hit: false }));
        this.nextNodeIndex = 0;
        this.isDrawing = false;
        this.currentPath = [];
        this.tattooTimerInterval = null;
        this.init();
    }

    init() {
        this.resize = this.resize.bind(this);
        this.resize();
        window.addEventListener('resize', this.resize);

        if (IS_TOUCH_DEVICE) {
            this.startTouchGame();
        } else {
            this.startDragGame();
        }
    }

    resize() {
        if (!this.canvas) return;
        const aspectRatio = 760/* 420;/*/ Proporção da arte original do sigilo
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.width/* aspectRatio;
        this.draw();
    }

    startDragGame() {
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    startTouchGame() {
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.canvas.addEventListener('click', this.handleCanvasClick);

        const timerEl = document.getElementById('tattoo-timer');
       /*/ Tempo limite baseado na sanidade, 10s max, diminui com sanidade baixa
        let timeLeft = 10 - Math.floor((100 - this.gameState.sanity)/* 20);
        if (timerEl) timerEl.textContent = timeLeft.toFixed(1);

        this.tattooTimerInterval = setInterval(() => {
            timeLeft -= 0.1;
            if (timerEl) timerEl.textContent = timeLeft.toFixed(1);
            if (timeLeft <= 0) this.finish(false);/*/ Tempo esgotado
        }, 100);
    }

    finish(success) {
       /*/ Remove todos os listeners de eventos do minigame
        window.removeEventListener('resize', this.resize);
        if (this.tattooTimerInterval) clearInterval(this.tattooTimerInterval);

        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('click', this.handleCanvasClick);

        this.onComplete(success);/*/ Chama o callback para mostrar o resultado
    }

    draw() {
        if (!this.ctx) return;
        const getX = (coord) => coord * this.canvas.width;
        const getY = (coord) => coord * this.canvas.height;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

       /*/ Desenha o traçado da tatuagem atual
        if (this.currentPath.length > 1) {
            this.ctx.strokeStyle = '#e0e0e0';/*/ Cor da linha da tatuagem
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(getX(this.currentPath[0].x), getY(this.currentPath[0].y));
            for (let i = 1; i < this.currentPath.length; i++) {
                this.ctx.lineTo(getX(this.currentPath[i].x), getY(this.currentPath[i].y));
            }
            this.ctx.stroke();
        }

       /*/ Desenha os nós alvo do sigilo
        this.targetNodes.forEach((node, index) => {
            const nodeX = getX(node.x);
            const nodeY = getY(node.y);
            const nodeRadius = Math.min(this.canvas.width, this.canvas.height) * 0.03;/*/ Raio do nó

            this.ctx.beginPath();
            this.ctx.arc(nodeX, nodeY, nodeRadius, 0, 2 * Math.PI);
            this.ctx.fillStyle = node.hit ? '#5d995f' : 'rgba(164, 161, 145, 0.5)';/*/ Verde se atingido, cinza claro senão
            this.ctx.fill();

           /*/ Destaca o nó atual a ser atingido
            if (index === this.nextNodeIndex) {
                this.ctx.strokeStyle = '#a4a191';/*/ Cor de destaque
                this.ctx.lineWidth = 3;
                this.ctx.shadowBlur = 10;/*/ Efeito de brilho para chamar atenção
                this.ctx.shadowColor = '#a4a191';
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;/*/ Reseta o brilho
            }

           /*/ Desenha o número do nó
            this.ctx.font = `bold ${nodeRadius}px 'Special Elite', cursive`;
            this.ctx.fillStyle = "#1a1a1a";/*/ Cor do texto do número
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(index + 1, nodeX, nodeY);
        });
    }

   /*/ Calcula a posição do mouse/toque, normalizada e com tremor
    getMousePos(evt) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = evt.clientX || (evt.touches && evt.touches[0].clientX);
        const clientY = evt.clientY || (evt.touches && evt.touches[0].clientY);

       /*/ Posição normalizada (0 a 1)
        let x = (clientX - rect.left)/* this.canvas.width;
        let y = (clientY - rect.top)/* this.canvas.height;

       /*/ Aplica tremor dependendo da Sanidade e multiplicador
        const shakeMagnitude = ((100 - this.gameState.sanity)/* 2000) * this.gameState.shakeMultiplier;
        if (shakeMagnitude > 0 && this.isDrawing) {/*/ Só treme se estiver desenhando
            x += (Math.random() - 0.5) * shakeMagnitude;
            y += (Math.random() - 0.5) * shakeMagnitude;
        }
        return { x, y };
    }

   /*/ --- Manipuladores de evento para Mouse (Drag) ---
    handleMouseDown(e) {
        if (this.nextNodeIndex !== 0) return;/*/ Só começa se for o nó 1

        const pos = this.getMousePos(e);
        const firstNode = this.targetNodes[0];
        const dx = pos.x - firstNode.x;
        const dy = pos.y - firstNode.y;

       /*/ Verifica se o clique foi próximo ao primeiro nó
        if (Math.sqrt(dx*dx + dy*dy) < 0.05) {
            this.isDrawing = true;
            this.currentPath = [pos];/*/ Inicia o caminho com a posição do clique
            firstNode.hit = true;
            this.nextNodeIndex = 1;
            this.draw();
        }
    }

    handleMouseUp() {
        if (!this.isDrawing) return;/*/ Ignora se não estava desenhando
       /*/ Finaliza o jogo, o resultado é determinado pela conexão de todos os nós
        this.finish(this.nextNodeIndex === this.targetNodes.length);
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;/*/ Só atualiza se estiver desenhando

        const pos = this.getMousePos(e);
        this.currentPath.push(pos);/*/ Adiciona a posição ao caminho atual

       /*/ Verifica se o próximo nó foi alcançado
        if (this.nextNodeIndex < this.targetNodes.length) {
            const nextNode = this.targetNodes[this.nextNodeIndex];
            const dx = pos.x - nextNode.x;
            const dy = pos.y - nextNode.y;

            if (Math.sqrt(dx*dx + dy*dy) < 0.05) {/*/ Distância para considerar o nó atingido
                nextNode.hit = true;
                this.nextNodeIndex++;
            }
        }
        this.draw();/*/ Redesenha o canvas
    }

   /*/ --- Manipulador de evento para Touch ---
    handleCanvasClick(e) {
        const pos = this.getMousePos(e);
        const nextNode = this.targetNodes[this.nextNodeIndex];

        if (!nextNode) {/*/ Se tentou clicar após atingir todos os nós ou errou antes
            this.finish(false);
            return;
        }

        const dx = pos.x - nextNode.x;
        const dy = pos.y - nextNode.y;

       /*/ Verifica se o toque foi próximo ao nó correto
        if (Math.sqrt(dx * dx + dy * dy) < 0.06) {/*/ Tolerância um pouco maior para toque
            nextNode.hit = true;
            this.nextNodeIndex++;
            if (this.nextNodeIndex === this.targetNodes.length) {
                this.finish(true);/*/ Sucesso completo
            }
            this.draw();
        } else {
            this.finish(false);/*/ Erro no toque
        }
    }
}

class Game {
    constructor() {
       /*/ Referências aos elementos DOM principais
        this.dom = {
            splashScreen: document.getElementById('splash-screen'),
            loreScreen: document.getElementById('lore-screen'),
            gameContainer: document.getElementById('game-container'),
            shakyCursor: document.getElementById('shaky-cursor'),
            mainView: document.getElementById('main-view'),
            dayStat: document.getElementById('day-stat'),
            clientStat: document.getElementById('client-stat'),
            sanityStat: document.getElementById('sanity-stat'),
            moneyStat: document.getElementById('money-stat'),
            startGameBtn: document.getElementById('start-game-btn'),
        };

       /*/ Referências aos elementos de áudio
        this.audioElements = {
            introMusic: document.getElementById('splash-music'),
            loreMusic: document.getElementById('lore-music'),
            gameBgMusic: document.getElementById('bg-music'),
            tattooMusic: document.getElementById('tattoo-music'),
            criticalMusic: document.getElementById('critical-music'),
            nightPhaseMusic: document.getElementById('save-music'),
            successSfx: document.getElementById('success-sfx'),
            errorSfx: document.getElementById('error-sfx'),
        };

       /*/ Estado inicial do jogo
        this.state = {
            sanity: 100,
            money: 50,
            day: 1,
            clientInDay: 1,
            currentClientIndex: 0,
            playerSigilChoice: null,
            shakeMultiplier: 1.0,
            sanityPerClient: 0,
            purchasedUpgrades: new Set()
        };

        this.minigame = null;
        this.activeMusic = null;
        this.lowSanityThreshold = 40;
        this.bindEvents();
    }

    bindEvents() {
       /*/ Eventos para iniciar o jogo a partir da Splash Screen
        window.addEventListener('keydown', () => this.handleSplashInteraction(), { once: true });
        this.dom.splashScreen.addEventListener('click', () => this.handleSplashInteraction(), { once: true });

       /*/ Evento para iniciar o jogo principal
        this.dom.startGameBtn.addEventListener('click', () => this.startGame());

       /*/ Configura listeners de erro para todos os elementos de áudio
        for (const key in this.audioElements) {
            if (this.audioElements[key]) {
                this.audioElements[key].onerror = () => console.error(`Erro de áudio: ${key}`);
            }
        }
    }

   /*/ Toca música de fundo com efeito de fade-in
    playMusic(musicElement, volume = 0.2) {
        if (!musicElement) return;

       /*/ Para a música ativa atual para evitar sobreposição
        if (this.activeMusic && this.activeMusic !== musicElement) {
            this.stopMusic(this.activeMusic);
        }
        this.activeMusic = musicElement;/*/ Define a nova música como ativa

       /*/ Garante que outras músicas de fundo parem completamente
        if (this.audioElements.introMusic && this.audioElements.introMusic !== musicElement && !this.audioElements.introMusic.paused) this.stopMusic(this.audioElements.introMusic);
        if (this.audioElements.tattooMusic && this.audioElements.tattooMusic !== musicElement && !this.audioElements.tattooMusic.paused) this.stopMusic(this.audioElements.tattooMusic);
        if (this.audioElements.criticalMusic && this.audioElements.criticalMusic !== musicElement && !this.audioElements.criticalMusic.paused) this.stopMusic(this.audioElements.criticalMusic);
        if (this.audioElements.nightPhaseMusic && this.audioElements.nightPhaseMusic !== musicElement && !this.audioElements.nightPhaseMusic.paused) this.stopMusic(this.audioElements.nightPhaseMusic);

        musicElement.currentTime = 0;
        const targetVolume = Math.max(0, Math.min(1, volume));/*/ Garante volume entre 0 e 1
        musicElement.volume = 0;/*/ Começa em mudo para o fade-in
        musicElement.play().catch(e => console.error("Erro ao tocar música:", e));/*/ Lida com erros de play (ex: bloqueio do navegador)

       /*/ Efeito de fade-in
        let fadeInInterval = setInterval(() => {
            if (musicElement.volume < targetVolume) {
                musicElement.volume += 0.02;
                musicElement.volume = Math.min(musicElement.volume, targetVolume);
            } else {
                musicElement.volume = targetVolume;/*/ Garante o volume final
                clearInterval(fadeInInterval);
            }
        }, 100);
    }

   /*/ Para música de fundo com efeito de fade-out
    stopMusic(musicElement) {
        if (!musicElement) return;

       /*/ Efeito de fade-out
        let fadeOutInterval = setInterval(() => {
            if (musicElement.volume > 0.01) {
                musicElement.volume -= 0.05;
                musicElement.volume = Math.max(musicElement.volume, 0);
            } else {
                musicElement.pause();
                musicElement.currentTime = 0;
                if (this.activeMusic === musicElement) this.activeMusic = null;/*/ Reseta se era a música ativa
                clearInterval(fadeOutInterval);
            }
        }, 80);
    }

   /*/ Toca um efeito sonoro (SFX)
    playSound(soundElement, volume = 0.5, duration = 0) {
        if (!soundElement) {
            console.warn("Tentativa de tocar SFX inválido (elemento nulo).");
            return;
        }
        soundElement.currentTime = 0;
        const clampedVolume = Math.max(0, Math.min(1, volume));
        soundElement.volume = clampedVolume;
        soundElement.play().catch(e => {});/*/ Lida com erros de play (ex: bloqueio do navegador)
        if (duration > 0) {
            setTimeout(() => {/*/ Para o som após a duração especificada
                if (soundElement && !soundElement.paused) {
                    soundElement.pause();
                    soundElement.currentTime = 0;
                }
            }, duration);
        }
    }

   /*/ Para todos os SFX que possam estar tocando
    stopAllSfx() {
        for (const key in this.audioElements) {
            if (key.endsWith('Sfx') && !this.audioElements[key].paused) {
                this.audioElements[key].pause();
                this.audioElements[key].currentTime = 0;
            }
        }
    }

   /*/ Gerencia a transição da Splash Screen para a Tela de Lore
    handleSplashInteraction() {
        this.playMusic(this.audioElements.introMusic, 0.4);/*/ Toca música de introdução

        this.dom.splashScreen.classList.add('faded-out');/*/ Inicia animação de fade-out
        setTimeout(() => {
            this.dom.splashScreen.classList.add('hidden');/*/ Oculta a splash screen
            this.dom.loreScreen.classList.remove('hidden');/*/ Mostra a tela de lore
            this.playMusic(this.audioElements.loreMusic, 0.3);/*/ Toca música de lore
        }, 1000);/*/ Tempo para a animação
    }

   /*/ Inicia o jogo principal após a Tela de Lore
    startGame() {
        this.dom.loreScreen.classList.add('faded-out');/*/ Inicia animação de fade-out
        setTimeout(() => {
            this.dom.loreScreen.classList.add('hidden');/*/ Oculta a tela de lore
            this.dom.gameContainer.classList.remove('hidden');/*/ Mostra o contêiner do jogo
            setTimeout(() => this.dom.gameContainer.classList.remove('faded-out'), 50);/*/ Pequeno delay para a transição
            this.initializeGame();/*/ Inicializa o estado do jogo
        }, 1000);
    }

   /*/ Configura o estado inicial do jogo
    initializeGame() {
        this.state.day = 1;
        this.state.clientInDay = 1;
        this.state.currentClientIndex = 0;
        this.updateStats();/*/ Atualiza os stats iniciais
        this.showTutorial();/*/ Mostra o tutorial
    }

   /*/ Altera o conteúdo da área principal do jogo
    showView(content) {
        this.dom.mainView.innerHTML = content;
    }

   /*/ Atualiza os indicadores de status na tela
    updateStats() {
        this.dom.dayStat.textContent = `Dia: ${this.state.day}`;
        this.dom.clientStat.textContent = `Cliente: ${this.state.clientInDay}/3`;
        this.dom.sanityStat.textContent = `Sanidade: ${Math.floor(this.state.sanity)}`;
        this.dom.moneyStat.textContent = `Dinheiro: $${this.state.money}`;
        this.applySanityEffects();/*/ Aplica efeitos visuais baseados na sanidade
    }

   /*/ Modifica a sanidade e aplica efeitos relacionados
    changeSanity(amount) {
        const oldSanity = this.state.sanity;
        this.state.sanity += amount;
        this.state.sanity = Math.max(0, Math.min(100, this.state.sanity));/*/ Limita sanidade entre 0 e 100

        this.updateStats();/*/ Atualiza a exibição

        const sanityLow = this.state.sanity <= this.lowSanityThreshold;
        const sanityWasLow = oldSanity <= this.lowSanityThreshold;

       /*/ Lógica para tocar música de baixa sanidade
        if (sanityLow && !sanityWasLow) {
            this.playMusic(this.audioElements.criticalMusic, 0.5);
        }
       /*/ Lógica para voltar à música de fundo normal
        else if (!sanityLow && sanityWasLow) {
            this.playMusic(this.audioElements.gameBgMusic, 0.3);
        }
    }

   /*/ Inicia uma nova fase noturna
    startNewDay() {
        this.state.day++;
        this.state.clientInDay = 1;
        this.playSound(this.audioElements.successSfx, 0.3, 2000);/*/ Som de sucesso

       /*/ Toca música da fase noturna
        this.playMusic(this.audioElements.nightPhaseMusic, 0.4);

       /*/ Após um tempo, volta para a música de jogo normal
        setTimeout(() => {
            this.stopMusic(this.audioElements.nightPhaseMusic);
            this.playMusic(this.audioElements.gameBgMusic, 0.3);
            this.loadClient();/*/ Carrega o primeiro cliente do novo dia
        }, 3000);
    }

   /*/ Carrega o próximo cliente ou finaliza o jogo
    loadNextClient() {
        this.stopAllSfx();/*/ Para SFX ativos

       /*/ Define a música de fundo correta com base na sanidade
        if (this.state.sanity <= this.lowSanityThreshold) {
            this.playMusic(this.audioElements.criticalMusic, 0.5);
        } else {
            this.playMusic(this.audioElements.gameBgMusic, 0.3);
        }

        this.state.currentClientIndex++;

       /*/ Verifica se todos os clientes foram atendidos
        if (this.state.currentClientIndex >= CLIENTS.length) {
            this.endGame();
            return;
        }

       /*/ Verifica se é hora de uma fase noturna (a cada 3 clientes)
        if (this.state.currentClientIndex > 0 && this.state.currentClientIndex % 3 === 0) {
            this.showNightPhase();
        } else {
           /*/ Atualiza o contador de clientes do dia e carrega o próximo
            this.state.clientInDay = (this.state.currentClientIndex % 3) + 1;
            this.loadClient();
        }
    }

   /*/ Carrega a interface de diálogo do cliente
    loadClient() {
        const client = CLIENTS[this.state.currentClientIndex];
        let buttonHtml;

       /*/ Define o botão de ação principal
        if (this.state.currentClientIndex === 0) {/*/ Primeiro cliente do jogo
            buttonHtml = `<button onclick="game.selectSigil('${client.correctSigil}')">Preparar a Agulha</button>`;
        } else if (client.request) {/*/ Cliente com pedido específico
            buttonHtml = `<p><em>O cliente te entrega um pedaço de papel amassado.</em></p><button onclick="game.startAnalysis()">Analisar o Pedido</button>`;
        } else {/*/ Cliente padrão
            buttonHtml = `<button onclick="game.openJournal()">Consultar o Diário de Abner</button>`;
        }

        const content = `
            <div id="client-view" class="view active">
                <div id="client-portrait-panel">
                    <img id="client-portrait" src="${client.portraitUrl}" alt="Retrato do Cliente">
                </div>
                <div id="client-dialogue-panel">
                    <h2>${client.name}</h2>
                    <p id="client-dialogue">'${client.problem}'</p>
                    ${buttonHtml}
                </div>
            </div>`;
        this.showView(content);
        this.updateStats();
    }

   /*/ Abre o Diário de Abner para escolher um sigilo
    openJournal() {
        let cards = `
            <div id="journal-view" class="view active">
                <h2>O Diário de Abner</h2>
                <p>Encontre o sigilo que corresponde à aflição do cliente.</p>
                <div id="journal-grid">`;

       /*/ Lista apenas sigilos seguros para escolha
        for (const id in SIGILS) {
            if (SIGILS[id].type === 'safe') {
                cards += `<div class="sigil-card" onclick="game.selectSigil('${id}')"><h3>${SIGILS[id].name}</h3></div>`;
            }
        }
        cards += `
                </div>
            </div>`;
        this.showView(cards);
    }

   /*/ Inicia o minigame de tatuagem com o sigilo escolhido
    selectSigil(sigilId) {
        this.stopMusic(this.activeMusic);/*/ Para a música atual
        this.playMusic(this.audioElements.tattooMusic, 0.4);/*/ Toca música do minigame

        this.state.playerSigilChoice = sigilId;
        const instructions = IS_TOUCH_DEVICE ? "Toque nos nós na ordem correta, rápido!" : "Clique no nó '1' e arraste para conectar os nós em ordem.";
        const content = `
            <div id="tattoo-view" class="view active">
                ${IS_TOUCH_DEVICE ? '<div id="tattoo-timer"></div>' : ''}
                <p id="tattoo-instructions">${instructions}</p>
                <canvas id="tattoo-canvas"></canvas>
            </div>`;
        this.showView(content);

        const canvas = document.getElementById('tattoo-canvas');
        this.minigame = new TattooMinigame(canvas, SIGILS[sigilId], this.state, (success) => this.showOutcome(success));
    }

   /*/ Mostra o resultado da tatuagem e ajusta o jogo
    showOutcome(result) {
        const client = CLIENTS[this.state.currentClientIndex];
        let correctSigilChoice = false;
        let chosenSigilId = this.state.playerSigilChoice;

       /*/ Verifica se a escolha do jogador foi correta
        if (client.request) {/*/ Cliente fez um pedido específico
            if (SIGILS[client.request].type === 'corrupted') {
                correctSigilChoice = (chosenSigilId === SIGILS[client.request].correctVersion);/*/ Corrigiu corrompido
            } else {
                correctSigilChoice = (chosenSigilId === client.request);/*/ Escolheu o normal pedido
            }
        } else {/*/ Cliente não fez pedido específico, compara com o sigilo correto para ele
            correctSigilChoice = (chosenSigilId === client.correctSigil);
        }

        let title, text, moneyChange = 0, sanityChange = 0;

        if (result && correctSigilChoice) {/*/ Sucesso e escolha correta
            title = "Trabalho Bem Feito";
            text = `O cliente sai satisfeito. Você recebe $${client.successPay}.`;
            moneyChange = client.successPay;
            sanityChange = 1 + this.state.sanityPerClient;/*/ Ganha sanidade
            this.playSound(this.audioElements.successSfx, 0.4, 2000);
        } else if (result && !correctSigilChoice) {/*/ Sucesso, mas escolha incorreta
            title = "Escolha Questionável";
            text = `O sigilo parece não ter o efeito desejado. O cliente paga $${client.wrongPay} e sai confuso.`;
            moneyChange = client.wrongPay;
            sanityChange = -5;/*/ Perde sanidade
            this.playSound(this.audioElements.errorSfx, 0.3);
        } else {/*/ Falha na tatuagem
            title = "Mão Trêmula, Destino Selado";
            text = `Sua mão falhou. O sigilo está corrompido. O cliente foge, deixando apenas $${client.failPay}.`;
            moneyChange = client.failPay;
            sanityChange = -10;/*/ Perda maior de sanidade
            this.playSound(this.audioElements.errorSfx, 0.3);
        }

        this.state.money += moneyChange;
        this.changeSanity(sanityChange);

        const content = `
            <div id="outcome-view" class="view active">
                <h2>${title}</h2>
                <p>${text}</p>
                <button onclick="game.loadNextClient()">Próximo Cliente</button>
            </div>`;
        this.showView(content);
        this.updateStats();
    }

   /*/ Exibe a tela da Fase Noturna com Lore e Loja
    showNightPhase() {
        const loreContent = LORE_PAGES[this.state.day] ? LORE_PAGES[this.state.day] : "<h3>Noite Silenciosa</h3><p>Você limpa o estúdio...</p>";

        let shopContent = '';
        for (const key in UPGRADES) {
            const up = UPGRADES[key];
            const isPurchased = this.state.purchasedUpgrades.has(key);
            shopContent += `
                <div class="upgrade-card">
                    <h4>${up.name}</h4>
                    <p>${up.description}</p>
                    <button id="upgrade-${key}" onclick="game.purchaseUpgrade('${key}')" ${isPurchased || this.state.money < up.cost ? 'disabled' : ''}>
                        ${isPurchased ? 'Comprado' : `Comprar ($${up.cost})`}
                    </button>
                </div>`;
        }

        const content = `
            <div id="night-view" class="view active">
                <h2>Fim do Dia ${this.state.day}</h2>
                <div id="lore-reveal">${loreContent}</div>
                <h3>Loja Noturna</h3>
                <p>Use seu dinheiro para se preparar.</p>
                <div id="upgrades-shop">${shopContent}</div>
                <button style="margin-top: 30px;" onclick="game.startNewDay()">Dormir e começar um novo dia</button>
            </div>`;
        this.showView(content);

        this.playMusic(this.audioElements.nightPhaseMusic, 0.4);/*/ Toca música da fase noturna
    }

   /*/ Compra um upgrade na loja
    purchaseUpgrade(key) {
        const upgrade = UPGRADES[key];
        if (this.state.money >= upgrade.cost && !this.state.purchasedUpgrades.has(key)) {
            this.playSound(this.audioElements.successSfx, 0.3, 2000);
            this.state.money -= upgrade.cost;
            upgrade.effect(this);/*/ Aplica o efeito do upgrade
            this.state.purchasedUpgrades.add(key);

           /*/ Atualiza o botão do upgrade para "Comprado" e o desabilita
            const btn = document.getElementById(`upgrade-${key}`);
            btn.textContent = 'Comprado';
            btn.classList.add('purchased');
            btn.disabled = true;

            this.updateStats();
        } else {
            this.playSound(this.audioElements.errorSfx, 0.2);/*/ Som de falha se não puder comprar
        }
    }

   /*/ Finaliza o jogo com a mensagem de encerramento apropriada
    endGame() {
        let endText = "Você sobreviveu... por enquanto. A reputação do estúdio cresce nos becos escuros de Port Blackwood. Novos clientes virão. A obra de Abner agora é sua. Você é o guardião... ou o porteiro.";
        if (this.state.sanity <= 0) {
            endText = "A tinta finalmente te consumiu. Você não tatua mais a pele, mas a própria realidade...";
        } else if (this.state.money < 0) {
            endText = "As dívidas se acumularam. Você fechou o estúdio, deixando para trás os segredos de Abner.";
        }
        const content = `
            <div id="outcome-view" class="view active">
                <h2>O Fim dos Capítulos</h2>
                <p style="font-size: 1.2em; line-height: 1.7;">${endText}</p>
            </div>`;
        this.showView(content);
       /*/ Opcional: tocar uma música de game over aqui
    }

   /*/ Inicia o processo de análise de um pedido de cliente
    startAnalysis() {
        const client = CLIENTS[this.state.currentClientIndex];
        const requestedSigil = SIGILS[client.request];

       /*/ Desenho do sigilo pedido pelo cliente
        let clientSigilHtml = '';
        if (requestedSigil) {
            clientSigilHtml = `<div class="sigil-drawing">${this.generateSigilDrawing(requestedSigil.nodes)}</div>`;
        }

        let journalSigilHtml = '';
        let journalLore = '';
        let comparisonSigilId = null;

       /*/ Determina qual sigilo do diário deve ser exibido para comparação
        if (requestedSigil) {
            if (requestedSigil.type === 'corrupted') {
                comparisonSigilId = requestedSigil.correctVersion;/*/ Se corrompido, mostra a versão correta
            } else {
                comparisonSigilId = client.request;/*/ Senão, mostra o sigilo pedido
            }
        }

        const journalSigil = SIGILS[comparisonSigilId];
        if (journalSigil) {
           /*/ Desenho do sigilo do diário
            journalSigilHtml = `<div class="sigil-drawing ${journalSigil.type === 'prohibited' ? 'prohibited' : ''}">${this.generateSigilDrawing(journalSigil.nodes)}</div>`;
            journalLore = `<p><strong>Nota de Abner:</strong> <em>${journalSigil.lore || 'Nenhuma nota encontrada.'}</em></p>`;
        }

       /*/ Gera as opções de diálogo para o jogador
        let dialogueOptions = '';
        if (requestedSigil) {
            if (requestedSigil.type === 'corrupted') {
                dialogueOptions += `<button onclick="game.handleAnalysisChoice('correct')">"Notei um erro. O correto é este." (+5 Sanidade)</button>`;
                dialogueOptions += `<button onclick="game.handleAnalysisChoice('accept_corrupted')">"Farei exatamente como pediu." (-20 Sanidade)</button>`;
            } else if (requestedSigil.type === 'prohibited') {
                dialogueOptions += `<button onclick="game.handleAnalysisChoice('refuse')">"Eu me recuso a fazer este símbolo." (+10 Sanidade)</button>`;
                dialogueOptions += `<button onclick="game.handleAnalysisChoice('accept_prohibited')">"Se você insiste... farei." (-50 Sanidade)</button>`;
            } else {/*/ Sigilo normal pedido pelo cliente
                 dialogueOptions += `<button onclick="game.handleAnalysisChoice('accept_normal')">"Entendido. Farei como foi pedido." (0 Sanidade)</button>`;
            }
        } else {/*/ Caso não encontre o sigilo solicitado
            dialogueOptions += `<p><em>Algo está errado com este pedido.</em></p>`;
        }

        const content = `
            <div id="analysis-view" class="view active">
                <h2>Analisando o Pedido</h2>
                <div class="comparison-area">
                    <div class="document-panel">
                        <h3>Pedido do Cliente</h3>
                        ${clientSigilHtml}
                    </div>
                    <div class="document-panel">
                        <h3>Diário de Abner</h3>
                        ${journalSigilHtml}
                        ${journalLore}
                    </div>
                </div>
                <div class="dialogue-options">${dialogueOptions}</div>
            </div>`;
        this.showView(content);
    }

   /*/ Processa a escolha do jogador após analisar um pedido
    handleAnalysisChoice(choice) {
        const client = CLIENTS[this.state.currentClientIndex];
        const requestedSigilId = client.request;
        const correctSigilId = SIGILS[requestedSigilId]?.correctVersion;/*/ A versão correta do sigilo corrompido

        switch (choice) {
            case 'correct':/*/ Corrigiu um sigilo corrompido
                this.changeSanity(5);
                this.selectSigil(correctSigilId);
                break;
            case 'accept_corrupted':/*/ Aceitou tatuar o sigilo corrompido
                this.changeSanity(-20);
                this.selectSigil(requestedSigilId);
                break;
            case 'refuse':/*/ Recusou um sigilo proibido
                this.changeSanity(10);
                const refusalContent = `
                    <div id="outcome-view" class="view active">
                        <h2>Escolha Sábia</h2>
                        <p>Você recusa o pedido. O cliente fica furioso e sai batendo a porta, sem pagar. Sua consciência, no entanto, está mais leve.</p>
                        <button onclick="game.loadNextClient()">Próximo Cliente</button>
                    </div>`;
                this.showView(refusalContent);
                break;
            case 'accept_prohibited':/*/ Aceitou tatuar um sigilo proibido
                this.changeSanity(-50);
                this.selectSigil(requestedSigilId);
                break;
            case 'accept_normal':/*/ Aceitou tatuar um sigilo normal conforme pedido
                 this.selectSigil(client.request);
                 break;
            default:
                console.error("Opção de análise desconhecida:", choice);
                break;
        }
    }

   /*/ Gera o HTML para desenhar um sigilo usando DIVs para linhas e nós
    generateSigilDrawing(nodes) {
        let html = '';
       /*/ Desenha as linhas que conectam os nós
        for (let i = 0; i < nodes.length - 1; i++) {
            const node = nodes[i];
            const nextNode = nodes[i + 1];
            const dx = (nextNode.x - node.x) * 100;/*/ Delta X em porcentagem
            const dy = (nextNode.y - node.y) * 100;/*/ Delta Y em porcentagem
            const length = Math.sqrt(dx*dx + dy*dy);/*/ Comprimento da linha
            const angle = Math.atan2(dy, dx) * 180/* Math.PI;/*/ Ângulo da linha
           /*/ Cria um div para a linha com transformações CSS
            html += `<div class="line" style="position: absolute; left: ${node.x * 100}%; top: ${node.y * 100}%; width: ${length}%; height: 2px; background-color: #333; transform-origin: 0 0; transform: rotate(${angle}deg);"></div>`;
        }
       /*/ Adiciona os nós como pequenos círculos
        nodes.forEach((node, index) => {
            html += `<div class="circle" style="position: absolute; left: ${node.x * 100}%; top: ${node.y * 100}%; width: 5px; height: 5px; background-color: #333; border-radius: 50%; transform: translate(-50%, -50%);"></div>`;
        });
        return html;
    }

   /*/ Aplica efeitos visuais ao jogo baseados na Sanidade
    applySanityEffects() {
        this.dom.gameContainer.classList.remove('sanity-effect-low', 'sanity-effect-medium');
        if (this.state.sanity <= this.lowSanityThreshold) {
            this.dom.gameContainer.classList.add('sanity-effect-low');/*/ Tremor de tela
            if (Math.random() < 0.08) this.triggerPortraitGlitch();/*/ Glitch no retrato
            if (Math.random() < 0.12) {/*/ Flicker no texto
                const el = document.querySelector("#lore-reveal p") || document.querySelector("#client-dialogue");
                this.triggerTextFlicker(el);
            }
        } else if (this.state.sanity <= 70) {
            this.dom.gameContainer.classList.add('sanity-effect-medium');/*/ Filtro de cor/saturação
            if (Math.random() < 0.03) this.triggerPortraitGlitch();
        }
    }

   /*/ Efeito visual de glitch no retrato do cliente
    triggerPortraitGlitch() {
        const portrait = document.getElementById('client-portrait');
        if (portrait) {
           /*/ this.playSound(this.audioElements.glitchSfx, 0.1);/*/ Efeito sonoro opcional
            portrait.classList.add('portrait-distort');
            setTimeout(() => {
                portrait.classList.remove('portrait-distort');
            }, 300);
        }
    }

   /*/ Efeito visual de flicker no texto
    triggerTextFlicker(element) {
        if (element) {
            element.classList.add('text-flicker');
            setTimeout(() => {
                element.classList.remove('text-flicker');
            }, 1500);
        }
    }

   /*/ Exibe o tutorial inicial para o jogador
    showTutorial() {
        const tutorialHtml = `
            <div id="tutorial-overlay" class="visible">
                <div id="tutorial-modal">
                    <h2>O Estúdio de Abner</h2>
                    <p>O cheiro de poeira e sal marinho se mistura ao odor metálico da tinta. A luz fraca de uma única lâmpada revela as paredes, cobertas por diagramas de sigilos que parecem se contorcer na penumbra.</p>
                    <p>Seu trabalho é ouvir o problema do cliente e escolher o sigilo correto em seu diário. Depois, execute a tatuagem com precisão. Sua sanidade depende disso.</p>
                    <button id="close-tutorial-btn">Receber o Primeiro Cliente</button>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', tutorialHtml);
        document.getElementById('close-tutorial-btn').addEventListener('click', () => {
            const overlay = document.getElementById('tutorial-overlay');
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                this.playMusic(this.audioElements.gameBgMusic, 0.3);/*/ Toca música de fundo do jogo
                this.loadClient();/*/ Carrega o primeiro cliente
            }, 500);
        });
    }
}

//Instancia o jogo ao carregar o script
const game = new Game();
// /js/data/pointClickData.js

export const SCENE_DATA = {
    'main_studio': {
        name: "Estúdio Principal",
        backgroundUrl: '/media/img/bg.png'
    },
    'back_office': {
        name: "Escritório de Abner",
        backgroundUrl: '/media/img/bg_journal.png'
    },
    'mail_room': {
        name: "Sala de Correspondências",
        backgroundUrl: '/media/img/bg_mail.png'
    }
};

export const HOTSPOTS_DATA = {
    'main_studio': [
        { 
            id: 'goto_office', 
            rect: { x: 20, y: 200, width: 100, height: 350 }, 
            onTrigger: { action: { type: 'goto_scene', payload: 'back_office' } }, 
            cursor: 'nav_left' 
        },
        { 
            id: 'goto_mail_room', 
            rect: { x: 850, y: 200, width: 150, height: 350 }, 
            onTrigger: { action: { type: 'goto_scene', payload: 'mail_room' } }, 
            cursor: 'nav_right' 
        },
        { 
            id: 'loose_floorboard', 
            rect: { x: 100, y: 550, width: 150, height: 80 }, 
            onTrigger: { 
                message: "Uma tábua no assoalho range sob seus pés. Você a força e encontra um pequeno compartimento escondido. Dentro, há uma chave de latão, fria ao toque.", 
                action: { type: 'add_inventory_item', payload: 'brass_key' } 
            }, 
            revealCondition: (gameState, localState) => !localState.inventory.includes('brass_key'),
            cursor: 'pickup' 
        },
        {
            id: 'strange_statue',
            rect: { x: 200, y: 200, width: 100, height: 150 },
            requires: 'broken_lens',
            onTrigger: { 
                message: "Com a lente, a sombra grotesca da estátua forma claramente os números '482' na parede oposta.", 
                action: { type: 'add_known_code', payload: '482' } 
            },
            defaultMessage: "Uma estatueta de um ser marinho indescritível, coberta de uma fina camada de poeira e sal.",
            cursor: 'inspect',
            hasWhispers: true
        },
        {
            id: 'vials_on_desk',
            rect: { x: 700, y: 450, width: 150, height: 100 },
            onTrigger: { 
                message: "Frascos de vidro contendo líquidos de cores estranhas. Um deles exala um cheiro adocicado e enjoativo que revira seu estômago.", 
                action: { type: 'drain_sanity', payload: 1 } 
            },
            cursor: 'inspect'
        },
        {
            id: 'client_chair',
            rect: { x: 450, y: 480, width: 200, height: 200 },
            onTrigger: { 
                message: "A cadeira onde tantos clientes se sentaram... Você sente o peso de suas ansiedades e esperanças impregnado no couro gasto." 
            },
            cursor: 'inspect'
        }
    ],
    'back_office': [
        { 
            id: 'goto_studio', 
            rect: { x: 850, y: 200, width: 150, height: 350 }, 
            onTrigger: { action: { type: 'goto_scene', payload: 'main_studio' } }, 
            cursor: 'nav_right' 
        },
        { 
            id: 'locked_box', 
            rect: { x: 758, y: 539, width: 120, height: 80 }, 
            requires: 'brass_key',
            onTrigger: { 
                message: "A chave de latão gira com um clique satisfatório. A caixa se abre. Dentro, não há um fragmento de sigilo, mas um pequeno diário de bolso de couro.", 
                action: { type: 'add_inventory_item', payload: 'pocket_diary' } 
            },
            revealCondition: (gameState, localState) => !localState.inventory.includes('pocket_diary'),
            defaultMessage: "Uma pequena caixa de madeira com uma fechadura de latão. Está trancada.", 
            cursor: 'inspect' 
        },
        {
            id: 'desk_drawer',
            rect: { x: 492, y: 462, width: 250, height: 80 },
            onTrigger: {
                message: (gameState, localState) => localState.knownCodes.includes('482') ? "Você sabe o código. Tentar abrir?" : "Uma das gavetas tem uma fechadura de combinação. Você não sabe o código.",
                action: (gameState, localState) => localState.knownCodes.includes('482') ? { type: 'show_numpad', solution: '482', on_success: { message: "A gaveta desliza silenciosamente. Dentro, sobre um veludo puído, repousa um Diapasão de Prata.", action: { type: 'add_inventory_item', payload: 'silver_tuning_fork' } } } : null
            },
            revealCondition: (gameState, localState) => !localState.inventory.includes('silver_tuning_fork'),
            cursor: 'inspect'
        },
        {
            id: 'wall_painting',
            rect: { x: 438, y: 112, width: 110, height: 95 },
            requires: 'silver_tuning_fork',
            onTrigger: { 
                message: "Você toca o diapasão no quadro. Ele emite uma única nota pura e vibrante. A pintura desliza para o lado, revelando um cofre embutido na parede!", 
                action: { type: 'change_scene_state', payload: { paintingMoved: true } } 
            },
            defaultMessage: "A pintura do cais de Port Blackwood. O olhar das figuras nos barcos parece segui-lo.",
            cursor: 'inspect'
        },
        {
            id: 'janela',
            rect: { x: 688, y: 175, width: 60, height: 125 },
          
            onTrigger: { 
                message: "Você olha para fora , sua espinha arrepia como se fose congelar , parece que alguem esta lhe observando do outro lado da rua.", 
                action: { type: 'jump_scare', payload: { major: true, sanity_drain: 5 } }
            },
            defaultMessage: "A pintura do cais de Port Blackwood. O olhar das figuras nos barcos parece segui-lo.",
            cursor: 'inspect'
        },

         {
            id: 'frascos_na_mesa',
            rect: { x: 688, y: 352, width: 140, height: 95 },
          
            onTrigger: { 
                message: "varios vidros e   frascos com liquidos estranhos , um deles exala um cheiro adocicado e enjoativo que revira seu estômago.", 
                action: { type: 'add_inventory_item', payload: 'póDeSonhos' }
            },
            defaultMessage: "varios vidros e   frascos com liquidos estranhos , um deles exala um cheiro adocicado e enjoativo que revira seu estômago.",
            cursor: 'inspect'
        },
        {
            id: 'hidden_safe',
            rect: { x: 438, y: 112, width: 110, height: 95 }, 
            revealCondition: (gameState, localState) => localState.sceneState.paintingMoved,
            onTrigger: { 
                message: "O cofre está destrancado. Dentro, envolto em um pano de veludo, está o fragmento final do sigilo de Astaroth.", 
                action: { type: 'add_special_item', payload: 'sigil_fragment_3' } 
            },
            cursor: 'pickup'
        },
        {
            id: 'back_bookshelf',
            rect: { x: 332, y: 329, width: 130, height: 50 },
            onTrigger: { 
                message: "Títulos sobre história oculta, criptografia e biologia marinha anômala. Abner era mais do que um simples tatuador; era um pesquisador do proibido." 
            },
            cursor: 'inspect'
        },
           {
            id: '2nd_bookshelf',
            rect: { x: 326, y: 231, width: 130, height: 50 },
            onTrigger: { 
                message: "preciso criar uma chamada aqui pra conseguir um arquivo no bestiario  " 
            },
            cursor: 'inspect'
        },
        {

            id: 'wall_torch',
            rect: { x: 100, y: 152, width: 52, height: 140 },
            onTrigger: { 
                message: "Uma tocha a óleo. Sua chama dança nervosamente, como se reagisse a uma brisa que você não consegue sentir." 
            },
            cursor: 'inspect',
            hasWhispers: true
        }
    ],
    'mail_room': [
        { 
            id: 'goto_studio_from_mail', 
            rect: { x: 20, y: 200, width: 100, height: 350 }, 
            onTrigger: { action: { type: 'goto_scene', payload: 'main_studio' } }, 
            cursor: 'nav_left' 
        },
        {
            id: 'mail_sorting_desk',
            rect: { x: 536, y: 125, width: 400, height: 200 },
            onTrigger: { 
                message: "Uma mesa de triagem de cartas. A maioria são contas e jornais velhos, mas uma carta de Kett, caída atrás de uma gaveta, chama sua atenção.", 
                action: { type: 'unlock_lore', payload: 'kett_hidden_letter' } 
            },
            cursor: 'inspect',
            hasWhispers: true
        },
        {
            id: 'dark_corner',
            rect: { x: 117, y: 143, width: 120, height: 180 },
            onTrigger: {
                message: "Apenas um canto escuro e empoeirado. Você se vira, mas um movimento rápido no canto do seu olho o faz olhar de volta...",
                action: { type: 'jump_scare', payload: { major: true, sanity_drain: 15 } }
            },
            cursor: 'inspect'
        }
    ]
};

export const POINTCLICK_ITEMS_DATA = {
    'brass_key': { 
        name: "Chave de Latão", 
        iconUrl: '/media/img/icons/brass_key.png'
    },
    'pocket_diary': {
        name: "Diário de Bolso de Abner",
        iconUrl: '/media/img/icons/pocket_diary.png',
        isReadable: true,
        content: "Armitage procura o poder visível. Ele nunca entenderia que a verdadeira essência se esconde na ressonância, não na visão. Para encontrar o que escondi, ouça o eco da arte e siga o número que a sombra projeta."
    },
    'broken_lens': {
        name: "Lente Quebrada",
        iconUrl: '/media/img/icons/broken_lens.png'
    },
    'silver_tuning_fork': {
        name: "Diapasão de Prata",
        iconUrl: '/media/img/icons/tuning_fork.png'
    }
};
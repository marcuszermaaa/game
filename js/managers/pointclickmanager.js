// /js/managers/pointClickManager.js
import { SCENE_DATA, HOTSPOTS_DATA, POINTCLICK_ITEMS_DATA } from '../data/pointClickData.js';

export class PointClickManager {
    constructor(gameState, onCompleteCallback) {
        this.gameState = gameState;
        this.onComplete = onCompleteCallback;

        this.container = document.getElementById('game-container');
        this.messageBox = document.getElementById('message-box').querySelector('span');
        this.inventoryContainer = document.getElementById('inventory');
        this.sanityBar = document.getElementById('sanity-bar-foreground');
        
        this.numpad = {
            overlay: document.getElementById('numpad-overlay'),
            display: document.getElementById('numpad-display'),
            buttons: document.getElementById('numpad-buttons'),
            confirmBtn: document.getElementById('numpad-confirm'),
            cancelBtn: document.getElementById('numpad-cancel')
        };
        this.currentNumpadAction = null;

        this.sounds = {
            whispers: [ new Audio('/media/sfx/whisper1.wav'), new Audio('/media/sfx/whisper2.wav'), new Audio('/media/sfx/whisper3.wav') ],
            jumpscare: new Audio('/media/sfx/jumpscare.mp3')
        };
        Object.values(this.sounds).flat().forEach(sound => sound.load());

        this.whisperCooldown = false;
        this.hotspots = [];
        this.messageTimeout = null;
        this.sanityDrainInterval = null;
        
        this.localState = {
            currentScene: 'main_studio',
            inventory: ['broken_lens'],
            selectedItem: null,
            sceneState: {},
            knownCodes: []
        };

        this.container.addEventListener('mousemove', (e) => this.updateCursor(e));
        this.container.addEventListener('click', (e) => this.handleClick(e));
        this.bindNumpadEvents();
    }

    bindNumpadEvents() {
        this.numpad.buttons.addEventListener('click', (e) => {
            if (e.target.dataset.digit) this.handleNumpadInput(e.target.dataset.digit);
        });
        this.numpad.confirmBtn.addEventListener('click', () => this.handleNumpadConfirm());
        this.numpad.cancelBtn.addEventListener('click', () => this.hideNumpad());
    }

    start() {
        this.loadScene(this.localState.currentScene);
        this.renderInventory();
        this.updateSanityUI();
        this.sanityDrainInterval = setInterval(() => {
            this.executeAction({ type: 'drain_sanity', payload: 1, silent: true });
        }, 8000);
    }

    destroy() {
        clearInterval(this.sanityDrainInterval);
        this.container.style.pointerEvents = 'none';
    }

    updateSanityUI() {
        if (!this.sanityBar) return;
        const sanity = this.gameState.sanity;
        const sanityPercent = (sanity / 100) * 100;
        this.sanityBar.style.width = `${Math.max(0, sanityPercent)}%`;
        
        let rotation = 0;
        if (sanity < 50) {
            rotation = ((50 - sanity) / 50) * 180;
        }
        this.container.style.transform = `rotate(${rotation}deg)`;
        
        if (sanity < 40 && Math.random() < 0.015) {
            this.triggerJumpScare({ major: false });
        }
    }

    loadScene(sceneId) {
        this.localState.currentScene = sceneId;
        const scene = SCENE_DATA[sceneId];
        this.container.style.backgroundImage = `url('${scene.backgroundUrl}')`;
        this.hotspots = HOTSPOTS_DATA[sceneId] || [];
        this.renderHotspots();
        this.showMessage(`Você está em: ${scene.name}`);
    }

    renderHotspots() {
        this.container.querySelectorAll('.hotspot').forEach(el => el.remove());
        this.hotspots.forEach(hotspotData => {
            if (hotspotData.revealCondition && !hotspotData.revealCondition(this.gameState, this.localState)) {
                return;
            }
            const div = document.createElement('div');
            div.className = 'hotspot';
            
            if (hotspotData.cursor === 'inspect') {
                div.classList.add('inspect-glow');
            }

            Object.assign(div.style, {
                left: `${hotspotData.rect.x}px`, top: `${hotspotData.rect.y}px`,
                width: `${hotspotData.rect.width}px`, height: `${hotspotData.rect.height}px`
            });
            div.dataset.hotspotId = hotspotData.id;
            div.style.display = 'block';
            this.container.appendChild(div);
        });
    }

    handleClick(event) {
        if (event.target.classList.contains('hotspot')) {
            this.triggerHotspot(event.target.dataset.hotspotId);
        }
    }

    triggerHotspot(id) {
        const hotspot = this.hotspots.find(h => h.id === id);
        if (!hotspot) return;

        let message, action;

        if (hotspot.requires && hotspot.requires === this.localState.selectedItem) {
            message = hotspot.onTrigger.message;
            action = hotspot.onTrigger.action;
            this.localState.inventory = this.localState.inventory.filter(item => item !== this.localState.selectedItem);
            this.deselectItem();
            this.renderInventory();
        } else {
            message = hotspot.defaultMessage || (typeof hotspot.onTrigger.message === 'function' ? hotspot.onTrigger.message(this.gameState, this.localState) : hotspot.onTrigger.message);
            if (!hotspot.requires) {
                action = typeof hotspot.onTrigger.action === 'function' ? hotspot.onTrigger.action(this.gameState, this.localState) : hotspot.onTrigger.action;
            }
        }
        
        this.showMessage(message);
        this.executeAction(action);
        this.renderHotspots();
    }

    executeAction(action) {
        if (!action) return;
        if (action.type === 'drain_sanity' && this.gameState.sanity <= action.payload) { this.triggerFaintSequence(); return; }
        switch (action.type) {
            case 'add_inventory_item': if (!this.localState.inventory.includes(action.payload)) { this.localState.inventory.push(action.payload); this.renderInventory(); } break;
            case 'goto_scene': this.loadScene(action.payload); break;
            case 'drain_sanity': if (!action.silent) this.showMessage("Você sente sua mente fraquejar..."); this.gameState.sanity -= action.payload; this.updateSanityUI(); break;
            case 'add_special_item': this.showMessage("Você encontrou o que procurava..."); this.triggerJumpScare({ major: true }); this.destroy(); setTimeout(() => { this.onComplete({ success: true, foundItem: action.payload, finalSanity: this.gameState.sanity }); }, 4000); break;
            case 'add_known_code': if (!this.localState.knownCodes.includes(action.payload)) { this.localState.knownCodes.push(action.payload); } break;
            case 'show_numpad': this.showNumpad(action); break;
            case 'change_scene_state': Object.assign(this.localState.sceneState, action.payload); break;
            case 'jump_scare': this.triggerJumpScare(action.payload); if (action.payload.sanity_drain) { this.executeAction({ type: 'drain_sanity', payload: action.payload.sanity_drain }); } break;
        }
    }

    showNumpad(action) {
        this.currentNumpadAction = action;
        this.numpad.display.textContent = '';
        this.numpad.overlay.style.display = 'flex';
    }

    hideNumpad() {
        this.numpad.overlay.style.display = 'none';
        this.currentNumpadAction = null;
    }

    handleNumpadInput(digit) {
        if (this.numpad.display.textContent.length < 3) {
            this.numpad.display.textContent += digit;
        }
    }

    handleNumpadConfirm() {
        const enteredCode = this.numpad.display.textContent;
        if (enteredCode === this.currentNumpadAction.solution) {
            this.showMessage(this.currentNumpadAction.on_success.message);
            this.executeAction(this.currentNumpadAction.on_success.action);
        } else {
            this.showMessage("O código está incorreto.");
            this.numpad.display.classList.add('error');
            setTimeout(() => {
                this.numpad.display.classList.remove('error');
                this.numpad.display.textContent = '';
            }, 500);
        }
        this.hideNumpad();
    }
    
    triggerJumpScare(config) {
        this.container.classList.add('jump-scare');
        if (config.major && this.sounds.jumpscare) {
            this.sounds.jumpscare.currentTime = 0;
            this.sounds.jumpscare.volume = 0.6;
            this.sounds.jumpscare.play();
        }
        setTimeout(() => {
            this.container.classList.remove('jump-scare');
        }, 300);
    }
    
    renderInventory() {
        this.inventoryContainer.innerHTML = '';
        Object.keys(POINTCLICK_ITEMS_DATA).forEach(itemId => {
            const itemData = POINTCLICK_ITEMS_DATA[itemId];
            const hasItem = this.localState.inventory.includes(itemId);
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.title = itemData.name;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            if (!hasItem) { itemDiv.classList.add('hidden'); }
            itemDiv.style.backgroundImage = `url('${itemData.iconUrl}')`;
            itemDiv.dataset.itemId = itemId;
            if (hasItem) {
                itemDiv.onclick = (e) => { e.stopPropagation(); this.selectItem(itemId); };
            }
            slot.appendChild(itemDiv);
this.inventoryContainer.appendChild(slot);
        });
    }

    selectItem(itemId) {
        const itemData = POINTCLICK_ITEMS_DATA[itemId];
        if (itemData.isReadable) {
            this.showMessage(itemData.content);
            this.deselectItem();
            return;
        }
        if (this.localState.selectedItem === itemId) {
            this.deselectItem();
            return;
        }
        this.deselectItem();
        this.localState.selectedItem = itemId;
        this.inventoryContainer.querySelector(`[data-item-id="${itemId}"]`).parentElement.classList.add('selected');
        this.updateCursor();
    }
    
    deselectItem() {
        if (this.localState.selectedItem) {
            this.inventoryContainer.querySelector(`[data-item-id="${this.localState.selectedItem}"]`)?.parentElement.classList.remove('selected');
        }
        this.localState.selectedItem = null;
        this.updateCursor();
    }

    updateCursor(event) {
        if (this.localState.selectedItem) {
            const itemData = POINTCLICK_ITEMS_DATA[this.localState.selectedItem];
            this.container.style.cursor = `url('${itemData.iconUrl}') 16 16, auto`;
            return;
        }

        let onHotspot = false;
        if (event && event.target.classList.contains('hotspot')) {
            const hotspot = this.hotspots.find(h => h.id === event.target.dataset.hotspotId);
            if (hotspot) {
                onHotspot = true;
                let cursorStyle = "url('/media/img/icons/hand_point_cursor.png') 16 0, auto";
                switch (hotspot.cursor) {
                    case 'inspect': cursorStyle = "url('/media/img/icons/eye_cursor.png') 16 16, auto"; break;
                    case 'pickup': cursorStyle = "url('/media/img/icons/hand_cursor.png') 16 16, auto"; break;
                    case 'nav_left': cursorStyle = "url('/media/img/icons/nav_left_cursor.png') 0 16, auto"; break;
                    case 'nav_right': cursorStyle = "url('/media/img/icons/nav_right_cursor.png') 32 16, auto"; break;
                }
                this.container.style.cursor = cursorStyle;

                if (hotspot.hasWhispers && !this.whisperCooldown) {
                    this.triggerWhisper();
                }
            }
        }
        
        if (!onHotspot) {
            this.container.style.cursor = "url('/media/img/icons/hand_point_cursor.png') 16 0, auto";
        }
    }

    triggerWhisper() {
        const sound = this.sounds.whispers[Math.floor(Math.random() * this.sounds.whispers.length)];
        if (sound) {
            sound.volume = 0.25;
            sound.currentTime = 0;
            sound.play().catch(e => console.error("[Whisper] Erro ao tocar o som:", e));
            this.whisperCooldown = true;
            setTimeout(() => { 
                this.whisperCooldown = false; 
            }, 3000);
        } else {
            console.error("[Whisper] Objeto de som está indefinido ou não foi encontrado.");
        }
    }

    showMessage(text) {
        clearTimeout(this.messageTimeout);
        this.messageBox.textContent = text;
        this.messageBox.style.opacity = 1;
        this.messageTimeout = setTimeout(() => {
            this.messageBox.style.opacity = 0;
        }, 5000);
    }

    triggerFaintSequence() {
        this.destroy();
        this.showMessage("A escuridão avança... você desmaiou...");
        setTimeout(() => {
            this.onComplete({ success: false, reason: 'fainted', finalSanity: 0 });
        }, 4000);
    }
}
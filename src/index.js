import { Application, Sprite, utils, Container } from 'pixi.js';
import Player from './components/player';
import WhiteCircle from './components/white-circle';
import RedZone from './components/red-zone';
import SafetyZone from './components/safety-zone';
import CarePackage from './components/care-package';
import { normalizeData } from './data';
import AlivePlayersUI from './ui/alive-players';
import ReplayTimeUI from './ui/replay-time';
import ZoomControllerUI from './ui/zoom-controller';
import { loadTextures, Background } from './assets';
import ObservablePoint from './observable/point';
import PlayerAttack from './components/player-attack';

class Minimap extends utils.EventEmitter {
    constructor(options = {}) {
        super();

        this._initializeOptions(options);

        this._initializeProperties();
        this._initializePIXI();

        if (this.options.data) {
            this.load(this.options.data);
        }
    }

    // region Initialize
    _initializeOptions(options) {
        let {
            data = null,
            size = 800,
            useHighBackground = true,
            showTimeUI = false,
            showZoomController = true,
            showAlivePlayers = true,
            wheelZoom = true,
            panDrag = true,
        } = options;

        size = Number(size);

        if (isNaN(size) || !Number.isInteger(size) || size <= 0) {
            throw 'size option must be positive integer';
        }

        if (typeof useHighBackground !== 'boolean') {
            throw 'useHighBackground option must be boolean';
        }

        if (typeof showTimeUI !== 'boolean') {
            throw 'showTimeUI option must be boolean';
        }

        if (typeof showZoomController !== 'boolean') {
            throw 'showZoomController option must be boolean';
        }

        if (typeof showAlivePlayers !== 'boolean') {
            throw 'showAlivePlayers option must be boolean';
        }

        if (typeof wheelZoom !== 'boolean') {
            throw 'wheelZoom option must be boolean';
        }

        if (typeof panDrag !== 'boolean') {
            throw 'panDrag option must be boolean';
        }

        this.options = {
            data,
            size,
            useHighBackground,
            showTimeUI,
            showZoomController,
            showAlivePlayers,
            wheelZoom,
            panDrag,
        };
    }

    _initializeProperties() {
        this._zoom = 1;

        this._center = new ObservablePoint(.5, .5);
        this._center.on('change', () => {
            let size = 1 / this.zoom;
            let halfSize = size / 2;

            let { x, y } = this.center;

            if (x - halfSize < 0) {
                x = halfSize;
            }
            else if (x + halfSize > 1) {
                x = 1 - halfSize;
            }

            if (y - halfSize < 0) {
                y = halfSize;
            }
            else if (y + halfSize > 1) {
                y = 1 - halfSize;
            }

            if (x !== this.center.x || y !== this.center.y) {
                this._center.set(x, y);
            }

            this._invalidate();
        });

        this.on('zoomChange', () => {
            this.center.set(this.center.x, this.center.y);
        });

        this._currentTime = 0;
        this._speed = 10;

        this._size = this.options.size;
        this._isPlaying = true;
    }

    _initializePIXI() {
        this.app = new Application({
            width: this.size,
            height: this.size,
            antialias: true,
        });
    }

    _initializeTextures() {
        loadTextures(this.data.meta.mapName, this.options.useHighBackground, () => {
            this.emit('textureLoad');
        });
    }

    _initializeUI() {
        // Add ui layer
        let uiLayer = new Container();
        this.uiLayer = uiLayer;

        this.app.stage.addChild(uiLayer);

        if (this.options.showAlivePlayers) {
            this._initializeAlivePlayersUI();
        }

        if (this.options.showTimeUI) {
            this._initializeReplayTimeUI();
        }

        if (this.options.showZoomController) {
            this._initializeZoomControllerUI();
        }
    }

    _initializeAlivePlayersUI() {
        let alivePlayers = new AlivePlayersUI(this.data.alivePlayers);
        alivePlayers.position.set(20, 20);

        this.uiLayer.addChild(alivePlayers);

        this.app.ticker.add(() => {
            alivePlayers.seek(this.currentTime);
        });
    }

    _initializeReplayTimeUI() {
        let renderer = this.app.renderer;

        let replayTime = new ReplayTimeUI();
        replayTime.position.set(renderer.width - replayTime.width - 20, 20);

        this.uiLayer.addChild(replayTime);

        this.app.ticker.add(() => {
            replayTime.seek(this.currentTime);
        });

        this.on('sizeChange', () => {
            replayTime.position.set(renderer.width - replayTime.width - 20, 20);
        });
    }

    _initializeZoomControllerUI() {
        let renderer = this.app.renderer;

        let zoomController = new ZoomControllerUI(this);
        zoomController.position.set(renderer.width - zoomController.width - 20, renderer.height - zoomController.height - 20);

        zoomController.on('expand', () => {
            let zoom = this.zoom + 1;
            if (zoom > 10) {
                zoom = 10;
            }

            this.zoom = zoom;
        });

        zoomController.on('contract', () => {
            let zoom = this.zoom - 1;
            if (zoom < 1) {
                zoom = 1;
            }

            this.zoom = zoom;
        });

        this.on('sizeChange', () => {
            zoomController.position.set(renderer.width - zoomController.width - 20, renderer.height - zoomController.height - 20);
        });

        this.uiLayer.addChild(zoomController);
    }

    _initializeComponents() {
        let componentLayer = new Container();
        this.componentLayer = componentLayer;

        this.components = [];

        this.app.stage.addChild(componentLayer);

        this._initializeBackground();
        this._initializeCircles();
        this._initializePlayers();
        this._initializeCarePackages();
        this._initializePlayerAttacks();
    }

    _initializeBackground() {
        let backgroundTexture;
        if (this.options.useHighBackground) {
            backgroundTexture = Background[this.data.meta.mapName].high;
        }
        else {
            backgroundTexture = Background[this.data.meta.mapName].low;
        }

        const background = new Sprite(backgroundTexture);
        this.background = background;

        background.width = this.app.renderer.width;
        background.height = this.app.renderer.height;

        this.componentLayer.addChild(background);
    }

    _initializeCircles() {
        let whiteCircle = new WhiteCircle(this, this.data.whiteCircle);
        let redZone = new RedZone(this, this.data.redZone);
        let safetyZone = new SafetyZone(this, this.data.safetyZone);

        this.components.push(whiteCircle);
        this.components.push(redZone);
        this.components.push(safetyZone);

        this.componentLayer.addChild(whiteCircle);
        this.componentLayer.addChild(safetyZone);
        this.componentLayer.addChild(redZone);
    }

    _initializePlayers() {
        let players = [];

        let playersContainer = new Container();
        this.componentLayer.addChild(playersContainer);

        for (let playerData of Object.values(this.data.players)) {
            let player = new Player(this, playerData);
            players.push(player);
            this.components.push(player);

            playersContainer.addChild(player);
        }
    }

    _initializeCarePackages() {
        // Create care packages
        let carePackagesContainer = new Container();
        this.componentLayer.addChild(carePackagesContainer);

        let carePackages = [];
        for (let carePackageData of this.data.carePackages) {
            let carePackage = new CarePackage(this, carePackageData);
            carePackages.push(carePackage);
            this.components.push(carePackage);

            carePackagesContainer.addChild(carePackage);
        }
    }

    _initializePlayerAttacks() {
        let playerAttackContainer = new Container();
        this.componentLayer.addChild(playerAttackContainer);

        for (let playerAttackData of this.data.playerAttacks) {
            let playerAttack = new PlayerAttack(this, playerAttackData);
            this.components.push(playerAttack);

            playerAttackContainer.addChild(playerAttack);
        }
    }

    _initializeEvents() {
        if (this.options.panDrag) {
            this._initializeMouseMove();
        }

        if (this.options.wheelZoom) {
            this._initializeMouseWheel();
        }
    }

    _initializeMouseMove() {
        let componentPosition = null;
        let startMousePosition = null;

        this.background.interactive = true;

        let move = e => {
            let { x: mouseX, y: mouseY } = e.data.global;

            let diffX = mouseX - startMousePosition.x;
            let diffY = mouseY - startMousePosition.y;

            let x = componentPosition.x + diffX;
            let y = componentPosition.y + diffY;

            let min = (1 - this.zoom) * this.size;

            if (x <= min) {
                x = min;
            }
            else if (x >= 0) {
                x = 0;
            }

            if (y <= min) {
                y = min;
            }
            else if (y >= 0) {
                y = 0;
            }

            let centerX = (-x + this.size / 2) / (this.size * this.zoom);
            let centerY = (-y + this.size / 2) / (this.size * this.zoom);

            this.center.set(centerX, centerY);
        };

        this.background.on('mousedown', e => {
            let { x: mouseX, y: mouseY } = e.data.global;
            let { x, y } = this.componentLayer.position;

            componentPosition = { x, y };
            startMousePosition = { x: mouseX, y: mouseY };
        });

        this.background.on('mousemove', e => {
            if (startMousePosition === null) return;

            move(e);
        });

        this.background.on('mouseup', e => {
            if (startMousePosition === null) return;

            move(e);

            componentPosition = null;
            startMousePosition = null;
        });

        this.background.on('mouseupoutside', e => {
            if (startMousePosition === null) return;

            move(e);

            componentPosition = null;
            startMousePosition = null;
        });
    }

    _initializeMouseWheel() {
        let canvas = this.app.view;

        this._onMouseWheel = e => {
            e.preventDefault();

            let renderer = this.app.renderer;
            let { clientX, clientY } = e;

            let mouseClientRatioX = clientX / renderer.width - 0.5;
            let mouseClientRatioY = clientY / renderer.height - 0.5;

            let mouseRatioX = mouseClientRatioX / this.zoom + this.center.x;
            let mouseRatioY = mouseClientRatioY / this.zoom + this.center.y;

            let zoomValue = e.deltaY * -0.005;
            let newZoom = this.zoom + zoomValue;

            let centerX = mouseRatioX - mouseClientRatioX / newZoom;
            let centerY = mouseRatioY - mouseClientRatioY / newZoom;

            this.zoom = newZoom;
            this.center.set(centerX, centerY);
        }

        canvas.addEventListener('wheel', this._onMouseWheel);
    }

    _initializeTimer() {
        let seeked = false;

        this.on('currentTimeChange', () => {
            seeked = true;
        });

        this._tick = delta => {
            let nextTime = this.currentTime;

            if (this.isPlaying) {
                nextTime += 1000 * delta / 60 * this.speed;
            }

            if (nextTime >= this.data.meta.duration) {
                nextTime = this.data.meta.duration;
                this.pause();
            }

            if (this._currentTime !== nextTime) {
                this._currentTime = nextTime;
                this.emit('currentTimeChange');
            }

            if (seeked) {
                for (let component of this.components) {
                    component.seek(nextTime);
                }

                seeked = false;
                return;
            }

            for (let component of this.components) {
                component.next(nextTime);
            }
        };

        this.app.ticker.add(this._tick);
    }
    // endregion

    // region Properties
    get zoom() {
        return this._zoom;
    }

    set zoom(value) {
        if (value < 1) value = 1;

        this._zoom = value;

        this.background.width = this.size * value;
        this.background.height = this.size * value;

        this._invalidate();
        this.emit('zoomChange');
    }

    get center() {
        return this._center;
    }

    set center(value) {
        this._center.set(value.x, value.y);
    }

    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;
    }

    get currentTime() {
        return this._currentTime;
    }

    set currentTime(value) {
        value = Number(value);
        if (isNaN(value)) return;

        this._currentTime = value;

        this.emit('currentTimeChange');
    }

    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;

        this.app.renderer.resize(value, value);

        let factor = this._zoom;
        let background = this.background;

        background.width = value * factor;
        background.height = value * factor;

        this._invalidate();

        this.emit('sizeChange');
    }

    get isPlaying() {
        return this._isPlaying;
    }

    set isPlaying(value) {
        this._isPlaying = value;

        this.emit('playStateChange');
    }
    // endregion

    // region Methods
    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    _invalidate() {
        let x = -(this.size * this.zoom) * this.center.x + this.size / 2;
        let y = -(this.size * this.zoom) * this.center.y + this.size / 2;

        this.componentLayer.position.set(x, y);
    }

    mount(parent) {
        parent.appendChild(this.app.view);
    }

    load(data, callback) {
        this.clear();

        this.data = normalizeData(data);
        this._initializeTextures();

        this.on('textureLoad', () => {
            this._initializeComponents();
            this._initializeUI();
            this._initializeEvents();
            this._initializeTimer();

            if (typeof callback === 'function') {
                callback();
            }

            this.emit('load');
        });
    }

    clear() {
        this._clearObjects();
        this._clearEvents();
        this._clearTimer();

        this._initializeProperties();
    }

    _clearObjects() {
        let stage = this.app.stage;

        while (stage.children.length) {
            let child = stage.children[0];
            stage.removeChild(child);

            child.destroy({
                children: true,
            });
        }

        this.components = [];
    }

    _clearEvents() {
        if (!this._onMouseWheel) return;

        this.app.view.removeEventListener('wheel', this._onMouseWheel);
        this._onMouseWheel = null;
    }

    _clearTimer() {
        if (!this._tick) return;

        this.app.ticker.remove(this._tick);
    }
    // endregion
}

export { Minimap };

import { Application, Texture, Sprite, utils, Container } from 'pixi.js';
import Player from './components/player';
import WhiteCircle from './components/white-circle';
import RedZone from './components/red-zone';
import SafetyZone from './components/safety-zone';
import CarePackage from './components/care-package';
import { normalizeData } from './data';
import AlivePlayersUI from './ui/alive-players';
import ZoomControllerUI from './ui/zoom-controller';
import { Background } from './assets';
import ObservablePoint from './observable/point';

const mapSize = 400000;

class Minimap extends utils.EventEmitter {
    constructor(data, options = {}) {
        super();

        this._initializeData(data);
        this._initializeOptions(options);
        this._initializeProperties();
        this._initializePIXI();
        this._initializeComponents();
        this._initializeUI();
        this._initializeEvents();
        this._initializeTimer();
    }

    // region Initialize
    _initializeData(data) {
        this.data = normalizeData(data, 1 / mapSize);
    }

    _initializeOptions(options) {
        options.size = options.size || 800;

        this.options = options;
    }

    _initializeProperties() {
        this._zoom = 1;

        this._center = new ObservablePoint(.5, .5);
        this._center.on('change', () => {
            this._invalidate();
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

    _initializeUI() {
        // Add ui layer
        let uiLayer = new Container();
        this.uiLayer = uiLayer;

        this.app.stage.addChild(uiLayer);

        this._initializeAlivePlayersUI();
        this._initializeZoomControllerUI();
    }

    _initializeAlivePlayersUI() {
        let alivePlayers = new AlivePlayersUI(this.data.alivePlayers);
        alivePlayers.position.set(20, 20);

        this.uiLayer.addChild(alivePlayers);

        this.on('currentTimeChange', () => {
            alivePlayers.seek(this.currentTime);
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

        this.app.stage.addChild(componentLayer);

        this._initializeBackground();
        this._initializeCircles();
        this._initializePlayers();
        this._initializeCarePackages();
    }

    _initializeBackground() {
        const background = new Sprite(Texture.from(Background[this.data.meta.mapName].low));
        this.background = background;

        background.width = this.app.renderer.width;
        background.height = this.app.renderer.height;

        this.componentLayer.addChild(background);
    }

    _initializeCircles() {
        let whiteCircle = new WhiteCircle(this, this.data.whiteCircle);
        let redZone = new RedZone(this, this.data.redZone);
        let safetyZone = new SafetyZone(this, this.data.safetyZone);

        this.componentLayer.addChild(whiteCircle);
        this.componentLayer.addChild(safetyZone);
        this.componentLayer.addChild(redZone);

        this.app.ticker.add(() => {
            whiteCircle.seek(this.currentTime);
            redZone.seek(this.currentTime);
            safetyZone.seek(this.currentTime);
        });
    }

    _initializePlayers() {
        let players = [];

        let playersContainer = new Container();
        this.componentLayer.addChild(playersContainer);

        for (let playerData of Object.values(this.data.players)) {
            let player = new Player(this, playerData);
            players.push(player);

            playersContainer.addChild(player);
        }

        this.app.ticker.add(() => {
            for (let player of players) {
                player.seek(this.currentTime);
            }
        });
    }

    _initializeCarePackages() {
        // Create care packages
        let carePackagesContainer = new Container();
        this.componentLayer.addChild(carePackagesContainer);

        let carePackages = [];
        for (let carePackageData of this.data.carePackages) {
            let carePackage = new CarePackage(this, carePackageData);
            carePackages.push(carePackage);

            carePackagesContainer.addChild(carePackage);
        }

        this.app.ticker.add(() => {
            for (let carePackage of carePackages) {
                carePackage.seek(this.currentTime);
            }
        });
    }

    _initializeEvents() {
        this._initializeMouseMove();
        this._initializeMouseWheel();
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

        canvas.addEventListener('wheel', e => {
            e.preventDefault();
            this.zoom += e.deltaY * -0.005;
        });
    }

    _initializeTimer() {
        this.app.ticker.add(delta => {
            if (!this.isPlaying) return;

            let nextTime = this.currentTime + 1000 * delta / 60 * this.speed;

            if (nextTime >= this.data.meta.duration) {
                nextTime = this.data.meta.duration;
                this.pause();
            }

            this.currentTime = nextTime;
        });
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

        this.center.set(x, y);

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
        this._currentTime = value;

        this.emit('currentTimeChange');

        if (!this.isPlaying) {
            this.app.render();
        }
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
    // endregion
}

export { Minimap };

import { Application, Texture, Sprite, utils, Container } from 'pixi.js';
import Player from './components/player';
import WhiteCircle from './components/white-circle';
import RedZone from './components/red-zone';
import SafetyZone from './components/safety-zone';
import CarePackage from './components/care-package';
import { normalizeData } from './utils';
import AlivePlayersUI from './ui/alive-players';
import ZoomControllerUI from './ui/zoom-controller';
import { Background } from './assets';
import ObservablePoint from './observable/point';

const canvasSize = 819;
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
    }

    _initializePIXI() {
        let app = new Application({
            width: this.options.size,
            height: this.options.size,
            antialias: true,
        });

        this.app = app;

        app.stage.size = this.options.size;
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

        this.app.ticker.add(() => {
            alivePlayers.seek(this.currentTime);
        });
    }

    _initializeZoomControllerUI() {
        let renderer = this.app.renderer;

        let zoomController = new ZoomControllerUI();
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

        this.on('size_change', () => {
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
        let whiteCircle = new WhiteCircle(this.data.whiteCircle);
        let redZone = new RedZone(this.data.redZone);
        let safetyZone = new SafetyZone(this.data.safetyZone);

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
            let player = new Player(playerData);
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
            let carePackage = new CarePackage(carePackageData);
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
    }

    _initializeMouseMove() {
        let componentPosition = null;
        let startMousePosition = null;

        this.app.stage.interactive = true;

        let move = e => {
            let { x: mouseX, y: mouseY } = e.data.global;

            let diffX = mouseX - startMousePosition.x;
            let diffY = mouseY - startMousePosition.y;

            let x = componentPosition.x + diffX;
            let y = componentPosition.y + diffY;

            let minX = this.app.renderer.width - this.app.stage.size;
            let minY = this.app.renderer.width - this.app.stage.size;

            if (x <= minX) {
                x = minX;
            }
            else if (x >= 0) {
                x = 0;
            }

            if (y <= minY) {
                y = minY;
            }
            else if (y >= 0) {
                y = 0;
            }

            let centerX = (-x + this.app.renderer.width / 2) / this.app.stage.size;
            let centerY = (-y + this.app.renderer.height / 2) / this.app.stage.size;

            this.center.set(centerX, centerY);
        };

        this.app.stage.on('mousedown', e => {
            let { x: mouseX, y: mouseY } = e.data.global;
            let { x, y } = this.componentLayer.position;

            componentPosition = { x, y };
            startMousePosition = { x: mouseX, y: mouseY };
        });

        this.app.stage.on('mousemove', e => {
            if (startMousePosition === null) return;

            move(e);
        });

        this.app.stage.on('mouseup', e => {
            if (startMousePosition === null) return;

            move(e);

            componentPosition = null;
            startMousePosition = null;
        });

        this.app.stage.on('mouseupoutside', e => {
            if (startMousePosition === null) return;

            move(e);

            componentPosition = null;
            startMousePosition = null;
        });
    }

    _initializeTimer() {
        this.app.ticker.add(delta => {
            this._currentTime += 1000 * delta / 60 * this.speed;
        });
    }
    // endregion

    // region Properties
    get zoom() {
        return this._zoom;
    }

    get center() {
        return this._center;
    }

    set center(value) {
        this._center.set(value.x, value.y);
    }

    set zoom(factor) {
        this._zoom = factor;

        let background = this.background;
        background.width = canvasSize * factor;
        background.height = canvasSize * factor;

        this.app.stage.size = canvasSize * factor;

        this._invalidate();
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

        this.app.stage.size = value * factor;

        this._invalidate();

        this.emit('size_change');
    }
    // endregion

    // region Methods
    play() {
        this.app.start();
    }

    pause() {
        this.app.stop();
    }

    _invalidate() {
        let canvasSize = this.app.renderer.width;
        let background = this.background;

        let x = -background.width * this.center.x + canvasSize / 2;
        let y = -background.height * this.center.y + canvasSize / 2;

        this.componentLayer.position.set(x, y);
    }
    // endregion
}

export { Minimap };

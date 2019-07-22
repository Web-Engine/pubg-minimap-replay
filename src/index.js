import { Application, Texture, Sprite, utils, Container } from 'pixi.js';
import Player from './components/player';
import WhiteCircle from './components/whiteCircle';
import RedZone from './components/redZone';
import SafetyZone from './components/safetyZone';
import CarePackage from './components/carePackage';
import { normalizeData } from './utils';
import AlivePlayerUI from './components/alivePlayers';
import ZoomButtonUI from './components/zoomButton';
import { Background } from './assets';
import ObservablePoint from './observable/point';

const canvasSize = 819;
const mapSize = 400000;

class Minimap extends utils.EventEmitter {
    constructor(data) {
        super();

        data = normalizeData(data, 1 / mapSize);

        this._zoom = 1;
        this._center = new ObservablePoint(.5, .5);

        this._data = data;

        // Create pixi application
        let app = new Application({
            width: canvasSize,
            height: canvasSize,
            antialias: true,
        });

        this.app = app;

        app.stage.width = canvasSize;
        app.stage.height = canvasSize;
        app.stage.size = canvasSize;

        // Add component layer
        let componentLayer = new Container();
        componentLayer.width = app.view.width;
        componentLayer.height = app.view.height;
        app.stage.addChild(componentLayer);
        this.componentLayer = componentLayer;

        // Load background sprite
        const backgroundTexture = Texture.from(Background[data.meta.mapName].low);
        const background = new Sprite(backgroundTexture);
        background.width = canvasSize;
        background.height = canvasSize;
        this.background = background;
        componentLayer.addChild(background);

        // Add ui layer
        let uiLayer = new Container();
        uiLayer.width = app.view.width;
        uiLayer.height = app.view.height;
        app.stage.addChild(uiLayer);

        this.uiLayer = uiLayer;

        this._currentTime = 0;
        this._speed = 10;

        // Increase time
        app.ticker.add(delta => {
            this._currentTime += 1000 * delta / 60 * this.speed;
        });

        // Add players
        let players = [];
        let playerContainer = new Container();
        componentLayer.addChild(playerContainer);

        for (let player of Object.values(data.players)) {
            let playerComponent = new Player(player);
            players.push(playerComponent);

            playerContainer.addChild(playerComponent);
        }

        app.ticker.add(() => {
            for (let player of players) {
                player.seek(this.currentTime);
            }
        });

        // Create circles
        let whiteCircle = new WhiteCircle(data.whiteCircle);
        let redZone = new RedZone(data.redZone);
        let safetyZone = new SafetyZone(data.safetyZone);

        componentLayer.addChild(whiteCircle);
        componentLayer.addChild(safetyZone);
        componentLayer.addChild(redZone);

        app.ticker.add(() => {
            whiteCircle.seek(this.currentTime);
            redZone.seek(this.currentTime);
            safetyZone.seek(this.currentTime);
        });

        // Create care packages
        let carePackageContainer = new Container();
        componentLayer.addChild(carePackageContainer);

        let carePackageSprites = [];
        for (let carePackage of data.carePackages) {
            let carePackageSprite = new CarePackage(carePackage);
            carePackageSprites.push(carePackageSprite);

            carePackageContainer.addChild(carePackageSprite);
        }

        app.ticker.add(() => {
            for (let carePackage of carePackageSprites) {
                carePackage.seek(this.currentTime);
            }
        });

        let alivePlayerUI = new AlivePlayerUI(data.alivePlayers);
        alivePlayerUI.position.set(20, 20);

        uiLayer.addChild(alivePlayerUI);

        app.ticker.add(() => {
            alivePlayerUI.seek(this.currentTime);
        });

        let zoomButtonUI = new ZoomButtonUI();
        zoomButtonUI.position.set(720, 760);

        zoomButtonUI.on('expand', () => {
            let zoom = this.zoom + 1;
            if (zoom > 10) {
                zoom = 10;
            }

            this.zoom = zoom;
        });

        zoomButtonUI.on('contract', () => {
            let zoom = this.zoom - 1;
            if (zoom < 1) {
                zoom = 1;
            }

            this.zoom = zoom;
        });

        uiLayer.addChild(zoomButtonUI);

        let componentPosition = null;
        let startMousePosition = null;

        background.interactive = true;

        let move = e => {
            let { x: mouseX, y: mouseY } = e.data.global;

            let diffX = mouseX - startMousePosition.x;
            let diffY = mouseY - startMousePosition.y;

            let x = componentPosition.x + diffX;
            let y = componentPosition.y + diffY;

            let minX = app.renderer.width - app.stage.size;
            let minY = app.renderer.width - app.stage.size;

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

            let centerX = (-x + app.renderer.width / 2) / app.stage.size;
            let centerY = (-y + app.renderer.height / 2) / app.stage.size;

            this.center.set(centerX, centerY);
        };

        background.on('mousedown', e => {
            let { x: mouseX, y: mouseY } = e.data.global;
            let { x, y } = componentLayer.position;

            componentPosition = { x, y };
            startMousePosition = { x: mouseX, y: mouseY };
        });

        background.on('mousemove', e => {
            if (startMousePosition === null) return;

            move(e);
        });

        background.on('mouseup', e => {
            if (startMousePosition === null) return;

            move(e);

            componentPosition = null;
            startMousePosition = null;
        });

        background.on('mouseupoutside', e => {
            if (startMousePosition === null) return;

            move(e);

            componentPosition = null;
            startMousePosition = null;
        });

        this.center.on('change', () => {
            this.invalidate();
        });
    }

    play() {
        this.app.start();
    }

    pause() {
        this.app.stop();
    }

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

        this.invalidate();
    }

    resize(canvasSize) {
        this.app.renderer.resize(canvasSize, canvasSize);

        let factor = this._zoom;
        let background = this.background;

        background.width = canvasSize * factor;
        background.height = canvasSize * factor;

        this.app.stage.size = canvasSize * factor;

        this.invalidate();
    }

    invalidate() {
        let canvasSize = this.app.renderer.width;
        let background = this.background;

        let x = -background.width * this.center.x + canvasSize / 2;
        let y = -background.height * this.center.y + canvasSize / 2;

        this.componentLayer.position.set(x, y);
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
}

export { Minimap };

import { Application, Texture, Sprite, Point, utils, Container } from 'pixi.js';
import * as PIXI from 'pixi.js'
import Player from './components/player'
import WhiteCircle from './components/whiteCircle';
import RedZone from './components/redZone';
import SafetyZone from './components/safetyZone';
import CarePackage from './components/carePackage';
import { findCurrentState, normalizeData } from './utils';
import AlivePlayerUI from "./components/alivePlavers";
import { Background } from './assets';

const canvasSize = 819;
const mapSize = 400000;
const size = 10000;

class Minimap extends utils.EventEmitter {
    constructor(data) {
        super();

        data = normalizeData(data, 1 / mapSize);

        this._zoom = 1;
        this._center = new Point(.5, .5);

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

        // Load background sprite
        const backgroundTexture = Texture.from(Background[data.meta.mapName].low);
        const background = new Sprite(backgroundTexture);
        background.width = canvasSize;
        background.height = canvasSize;
        app.stage.addChild(background);

        this.background = background;

        // Add ui layer
        let uiLayer = new Container();
        uiLayer.width = app.view.width;
        uiLayer.height = app.view.height;
        app.stage.addChild(uiLayer);

        this.uiLayer = uiLayer;

        // add component layer
        let componentLayer = new Container();
        componentLayer.width = app.view.width;
        componentLayer.height = app.view.height;
        app.stage.addChild(componentLayer);

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

        this.app.ticker.add(() => {
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

        this.app.ticker.add(() => {
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

        this.app.ticker.add(() => {
            for (let carePackage of carePackageSprites) {
                carePackage.seek(this.currentTime);
            }
        });

        let alivePlayerUI = new AlivePlayerUI(data.alivePlayers);
        alivePlayerUI.position.set(20, 20);

        uiLayer.addChild(alivePlayerUI);

        this.app.ticker.add(() => {
            alivePlayerUI.seek(this.currentTime);
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

    set zoom(factor) {
        this._zoom = factor;

        this.resize(this.app.renderer.width);
    }

    resize(canvasSize) {
        this.app.renderer.resize(canvasSize, canvasSize);

        let factor = this._zoom;

        let background = this.background;
        background.width = canvasSize * factor;
        background.height = canvasSize * factor;

        let x = - background.width * this.center.x + canvasSize / 2;
        let y = - background.height * this.center.y + canvasSize / 2;

        this.app.stage.position.set(x, y);
        this.app.stage.size = canvasSize * factor;
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

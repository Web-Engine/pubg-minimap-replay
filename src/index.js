import { Application, Texture, Sprite, Point, utils } from 'pixi.js';
import Player from './components/player'
import WhiteCircle from './components/whiteCircle';
import RedZone from './components/redZone';
import SafetyZone from './components/safetyZone';
import CarePackage from './components/carePackage';
import { normalizeData } from './utils';

import { Background } from './assets';

const canvasSize = 819;
const mapSize = 400000;
const size = 10000;

class Minimap extends utils.EventEmitter {
    constructor(data) {
        super();

        const sizeRatio = size / mapSize;

        data = normalizeData(data, sizeRatio);

        this._zoomFactor = 1;
        this._centerPosition = new Point(size / 2, size / 2);

        this._data = data;

        // Create pixi application
        this.app = new Application({
            width: canvasSize,
            height: canvasSize,
            antialias: true,
        });

        this.app.stage.transform.scale.set(canvasSize / size, canvasSize / size);

        this._currentTime = 0;
        this._speed = 10;

        // Increase time
        this.app.ticker.add(delta => {
            this._currentTime += 1000 * delta / 60 * this.speed;
        });

        // Load background sprite
        const backgroundTexture = Texture.from(Background[data.meta.mapName].low);
        const background = new Sprite(backgroundTexture);
        background.width = size;
        background.height = size;
        this.app.stage.addChild(background);

        // Create players
        let playerSprites = [];

        for (let player of Object.values(data.players)) {
            let playerSprite = new Player(this, player);
            this.app.stage.addChild(playerSprite);

            playerSprites.push(playerSprite);
        }

        this.app.ticker.add(() => {
            for (let player of playerSprites) {
                player.seek(this.currentTime);
            }
        });

        // Create circles
        let whiteCircle = new WhiteCircle(this, data.whiteCircle);
        let redZone = new RedZone(this, data.redZone);
        let safetyZone = new SafetyZone(this, data.safetyZone);

        this.app.stage.addChild(whiteCircle);
        this.app.stage.addChild(safetyZone);
        this.app.stage.addChild(redZone);

        this.app.ticker.add(() => {
            whiteCircle.seek(this.currentTime);
            redZone.seek(this.currentTime);
            safetyZone.seek(this.currentTime);
        });

        // Create care packages
        let carePackageSprites = [];

        for (let carePackage of data.carePackages) {
            let carePackageSprite = new CarePackage(this, carePackage);
            this.app.stage.addChild(carePackageSprite);

            carePackageSprites.push(carePackageSprite);
        }

        this.app.ticker.add(() => {
            for (let carePackage of carePackageSprites) {
                carePackage.seek(this.currentTime);
            }
        });
    }

    play() {
        this.app.start();
    }

    pause() {
        this.app.stop();
    }

    get zoom() {
        return this._zoomFactor;
    }

    get centerPosition() {
        return this._centerPosition;
    }

    setZoom(factor, position = null) {
        this._zoomFactor = factor;

        if (position) {
            this._centerPosition = position;
        }

        let canvasSize = this.app.renderer.width;
        this.app.stage.transform.scale.set(canvasSize / size * factor, canvasSize / size * factor);

        this.app.stage.transform.position.x = (this._centerPosition.x / size) * canvasSize - canvasSize * factor / 2;
        this.app.stage.transform.position.y = (this._centerPosition.y / size) * canvasSize - canvasSize * factor / 2;

        this.emit('zoomChange', factor, position);
    }

    resize(canvasSize) {
        this.app.renderer.resize(canvasSize, canvasSize);
        this.app.stage.transform.scale.set(canvasSize / size, canvasSize / size);
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

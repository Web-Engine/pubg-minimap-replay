import { Application, Texture, Sprite } from 'pixi.js';
import Player from './components/player'
import WhiteCircle from './components/whiteCircle';
import RedZone from './components/redZone';
import SafetyZone from './components/safetyZone';
import { normalizeData } from './utils';

import { Background } from './assets';

const canvasSize = 819;
const mapSize = 400000;
const size = 10000;

class Minimap {
    constructor(data) {
        const sizeRatio = size / mapSize;

        data = normalizeData(data, sizeRatio);

        this._data = data;

        // Create pixi application
        this.app = new Application({
            width: canvasSize,
            height: canvasSize,
            antialias: true,
        });

        this.app.stage.transform.scale.set(canvasSize / size, canvasSize / size);

        this.currentTime = 0;

        // Increase time
        this.app.ticker.add(delta => {
            this.currentTime += delta * window.speed;
        });

        // Load background sprite
        const backgroundTexture = Texture.from(Background.Sanhok.low);
        const background = new Sprite(backgroundTexture);
        background.width = size;
        background.height = size;
        this.app.stage.addChild(background);

        // Create players
        let playerSprites = [];

        for (let player of data.players) {
            let playerSprite = new Player(player);
            this.app.stage.addChild(playerSprite);

            playerSprites.push(playerSprite);
        }

        this.app.ticker.add(() => {
            for (let player of playerSprites) {
                player.seek(this.currentTime);
            }
        });

        // Create circles
        let whiteCircle = new WhiteCircle(data.whiteCircle);
        let redZone = new RedZone(data.redZone);
        let safetyZone = new SafetyZone(data.safetyZone);

        this.app.stage.addChild(whiteCircle);
        this.app.stage.addChild(safetyZone);
        this.app.stage.addChild(redZone);

        this.app.ticker.add(() => {
            whiteCircle.seek(this.currentTime);
            redZone.seek(this.currentTime);
            safetyZone.seek(this.currentTime);
        });
    }

    resize(canvasSize) {
        this.app.renderer.resize(canvasSize, canvasSize);
        this.app.stage.transform.scale.set(canvasSize / size, canvasSize / size);
    }
}

window.speed = 100;

export { Minimap };

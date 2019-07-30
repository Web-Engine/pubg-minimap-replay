import * as PIXI from 'pixi.js';
import GamePlayer from './game-player';
import GameUI from './game-ui';

class Minimap extends PIXI.utils.EventEmitter {
    constructor(data) {
        super();

        this._data = data;

        this._initializeOptions();
        this._initializePIXI();

        this._initializeProperties();

        this._loadAssets(data);

        this.on('assetsLoaded', () => {
            this._initializeComponents();
            this._initializeUI();
            this._initializeEvents();
            this._initializeTicker();
        });
    }

    _initializeOptions() {

    }

    _initializePIXI() {
        this._app = new PIXI.Application({
            width: this._data.canvas.width,
            height: this._data.canvas.height,
            antialias: true,
            autoStart: true,
        });
    }

    _initializeProperties() {
        this._currentTime = 0;
    }

    _loadAssets(data) {
        for (let key in data.assets) {
            if (!Object.prototype.hasOwnProperty.call(data.assets, key)) continue;

            this._app.loader.add(key, data.assets[key]);
        }

        this._app.loader.load((loader, resources) => {
            function setTexture(data) {
                data.texture = resources[data.image].texture;
            }

            setTexture(data.game.background);

            data.players.forEach(player => {
                player.shapes.filter(shape => shape.type === 'image').forEach(shape => setTexture(shape));
            });

            this.emit('assetsLoaded');
        });
    }

    _initializeComponents() {
        this._componentLayer = new PIXI.Container();
        this._app.stage.addChild(this._componentLayer);

        this._components = [];
        this._initializeBackground();
        this._initializePlayers();
        this._initializePlayerAttacks();
    }

    _initializeBackground() {
        this._background = new PIXI.Sprite(this._data.game.background.texture);
        this._app.stage.addChild(this._background);
    }

    _initializePlayers() {
        for (let data of this._data.players) {
            let player = new GamePlayer(data);
            this._componentLayer.addChild(player);

            this._components.push(player);
        }
    }

    _initializePlayerAttacks() {
    }

    _initializeUI() {
        this._uiLayer = new PIXI.Container();
        this._app.stage.addChild(this._uiLayer);

        for (let data of this._data.ui) {
            let ui = new GameUI(data);
            this._uiLayer.addChild(ui);

            this._components.push(ui);
        }
    }

    _initializeEvents() {

    }

    _initializeTicker() {
        this._app.ticker.add(delta => {
            this._currentTime += delta;

            this._components.forEach(component => component.update(this.currentTime));
        });
    }

    mount(parent) {
        parent.appendChild(this._app.view);
    }

    start() {
        this._app.start();
    }

    stop() {
        this._app.stop();
    }

    get currentTime() {
        return this._currentTime;
    }

    set currentTime(value) {
        this._currentTime = value;
    }

    get speed() {
        return this._app.speed;
    }

    set speed(value) {
        this._app.speed = value;
    }
}

export { Minimap };

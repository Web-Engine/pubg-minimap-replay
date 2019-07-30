import * as PIXI from 'pixi.js';
import GamePlayer from './game-player';
import GameUI from './game-ui';
import ObservablePoint from './observable/point';

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
        this._zoom = 1;
        this._speed = 10;
        this._center = new ObservablePoint(this.gameWidth / 2, this.gameHeight / 2);

        this._center.on('change', () => {
            let minX = this.gameWidth / this.zoom / 2;
            let maxX = this.gameWidth - minX;
            let minY = this.gameHeight / this.zoom / 2;
            let maxY = this.gameHeight - minY;

            let { x, y } = this._center;

            x = Math.min(Math.max(x, minX), maxX);
            y = Math.min(Math.max(y, minY), maxY);

            if (this._center.x !== x || this._center.y !== y) {
                this._center.set(x, y);
                return;
            }

            this._invalidate();
        });
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
        this._background.width = this.width * this.zoom;
        this._background.height = this.height * this.zoom;
        this._componentLayer.addChild(this._background);
    }

    _initializePlayers() {
        for (let data of this._data.players) {
            let player = new GamePlayer(this, data);
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
        this._initializePanDrag();

    }

    _initializePanDrag() {
        let centerStart = null;
        let mouseStart = null;

        this._background.interactive = true;

        let move = e => {
            let { x: mouseX, y: mouseY } = e.data.global;

            let diffX = mouseX - mouseStart.x;
            let diffY = mouseY - mouseStart.y;

            let x = centerStart.x - diffX / this.scaleX;
            let y = centerStart.y - diffY / this.scaleY;

            this.center.set(x, y);
        };

        let mouseDown = e => {
            let { x: mouseX, y: mouseY } = e.data.global;
            let { x, y } = this.center;

            centerStart = { x, y };
            mouseStart = { x: mouseX, y: mouseY };
        };

        let mouseMove = e => {
            if (mouseStart === null) return;

            move(e);
        };

        let mouseUp = e => {
            if (mouseStart === null) return;

            move(e);

            centerStart = null;
            mouseStart = null;
        };

        this._background.on('mousedown', mouseDown);
        this._background.on('mousemove', mouseMove);
        this._background.on('mouseup', mouseUp);
        this._background.on('mouseupoutside', mouseUp);
    }

    _initializeTicker() {
        this._app.ticker.add(delta => {
            this._currentTime += delta * 1000 / 60 * this._speed;

            this._components.forEach(component => component.update(this.currentTime));
        });
    }

    // on zoom change
    // on width change
    // on height change
    // on center change
    _invalidate() {
        this._background.width = this.width * this.zoom;
        this._background.height = this.height * this.zoom;

        let x = (this.center.x / this.gameWidth * this.zoom - 0.5) * this.width;
        let y = (this.center.y / this.gameWidth * this.zoom - 0.5) * this.height;

        this._componentLayer.position.set(-x, -y);
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

        this.emit('currentTimeChange');
    }

    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;

        this.emit('speedChange');
    }

    get center() {
        return this._center;
    }

    set center(value) {
        this._center.set(value.x, value.y);
    }

    get scaleX() {
        return this.width * this.zoom / this.gameWidth;
    }

    get scaleY() {
        return this.height * this.zoom / this.gameHeight;
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(value) {
        this._zoom = value;

        this._center.set(this._center.x, this._center.y);
        this._invalidate();
        this.emit('zoomChange');
    }

    get gameWidth() {
        return this._data.game.width;
    }

    get gameHeight() {
        return this._data.game.height;
    }

    get width() {
        return this._app.renderer.width;
    }

    set width(value) {
        this._app.renderer.resize(value, this._app.renderer.height);

        this._invalidate();
        this.emit('widthChange');
    }

    get height() {
        return this._app.renderer.height;
    }

    set height(value) {
        this._app.renderer.resize(this._app.renderer.width, value);

        this._invalidate();
        this.emit('heightChange');
    }

    get canvas() {
        return this._app.view;
    }
}

export { Minimap };

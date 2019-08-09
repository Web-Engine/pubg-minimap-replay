import * as PIXI from 'pixi.js';
import GameObject from './components/game-object';
import GameCharacter from './components/game-character';
import GameAttack from './components/game-attack';
import GameUI from './game-ui';
import ObservablePoint from './observable/point';

import TextTooltip from './tooltips/text-tooltip';
import TextTimeTooltip from './tooltips/text-time-tooltip';

class Minimap extends PIXI.utils.EventEmitter {
    // region Constructor
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

            this._isLoaded = true;
            this._invalidate();
        });
    }
    // endregion

    // region Initializes
    _initializeOptions() {

    }

    _initializePIXI() {
        this._app = new PIXI.Application({
            width: this._data.canvas.width,
            height: this._data.canvas.height,
            antialias: true,
            autoStart: false,
        });
    }

    _initializeProperties() {
        this._currentTime = 0;
        this._zoom = 1;
        this._speed = 10;
        this._isPlaying = false;
        this._components = [];
        this._attacks = [];
        this._tooltips = [];
        this._isLoaded = false;

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

            data.characters.forEach(character => {
                character.shapes.filter(shape => shape.type === 'image').forEach(shape => setTexture(shape));
            });

            data.objects.forEach(character => {
                character.shapes.filter(shape => shape.type === 'image').forEach(shape => setTexture(shape));
            });

            data.attacks.map(attack => attack.shape).filter(shape => shape.type === 'image').forEach(shape => setTexture(shape));

            this.emit('assetsLoaded');
        });
    }

    _initializeComponents() {
        this._zoomLayer = new PIXI.Container();
        this._app.stage.addChild(this._zoomLayer);

        this._componentLayer = new PIXI.Container();
        this._zoomLayer.addChild(this._componentLayer);

        this._attackLayer = new PIXI.Container();
        this._zoomLayer.addChild(this._attackLayer);

        this._tooltipLayer = new PIXI.Container();
        this._zoomLayer.addChild(this._tooltipLayer);

        this._initializeBackground();
        this._initializeObjects();
        this._initializeCharacter();
        this._initializeAttacks();
    }

    _initializeBackground() {
        this._background = new PIXI.Sprite(this._data.game.background.texture);
        this._background.width = this.width * this.zoom;
        this._background.height = this.height * this.zoom;
        this._componentLayer.addChild(this._background);
    }

    _initializeObjects() {
        for (let data of this._data.objects) {
            let object = new GameObject(this, data.locations, data.shapes);
            this._componentLayer.addChild(object);

            this._components.push(object);

            if (!data.tooltips || !data.tooltips.length) continue;

            let tooltip = new TextTimeTooltip(data.tooltips);
            tooltip.connect(object);
            tooltip.visible = false;

            this._tooltipLayer.addChild(tooltip);
            this._tooltips.push(tooltip);

            let fix = false;

            object.interactive = true;
            object.buttonMode = true;

            object.on('mouseover', () => {
                if (fix) return;

                tooltip.visible = true;

                if (this.isPlaying) return;
                this._forceRender();
            });

            object.on('click', () => {
                fix = !fix;
            });

            object.on('mouseout', () => {
                if (fix) return;

                tooltip.visible = false;

                if (this.isPlaying) return;
                this._forceRender();
            });
        }
    }

    _initializeCharacter() {
        for (let data of this._data.characters) {
            let character = new GameCharacter(this, data);
            this._componentLayer.addChild(character);

            this._components.push(character);

            if (!data.name) return;

            character.interactive = true;
            character.buttonMode = true;

            let tooltip = new TextTooltip(data.name);
            tooltip.connect(character);
            tooltip.visible = false;

            this._tooltipLayer.addChild(tooltip);

            let fix = false;

            character.on('mouseover', () => {
                if (fix) return;

                tooltip.visible = true;

                if (this.isPlaying) return;
                this._forceRender();
            });

            character.on('click', () => {
                fix = !fix;
            });

            character.on('mouseout', () => {
                if (fix) return;

                tooltip.visible = false;

                if (this.isPlaying) return;
                this._forceRender();
            });
        }
    }

    _initializeAttacks() {
        for (let data of this._data.attacks) {
            let attack = new GameAttack(this, data);

            this._attackLayer.addChild(attack);
            this._attacks.push(attack);
        }
    }

    _initializeUI() {
        this._uiLayer = new PIXI.Container();
        this._app.stage.addChild(this._uiLayer);

        this._uis = [];

        for (let data of this._data.ui) {
            let ui = new GameUI(data);
            this._uiLayer.addChild(ui);

            this._uis.push(ui);
        }
    }

    _initializeEvents() {
        this._initializePanDrag();
        this._initializeWheelZoom();
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

    _initializeWheelZoom() {
        this.canvas.addEventListener('wheel', e => {
            e.preventDefault();

            let { layerX, layerY } = e;

            layerX -= this.width / 2;
            layerY -= this.height / 2;

            layerX *= this.gameWidth / this.width;
            layerY *= this.gameHeight / this.height;

            let mouseX = this.center.x + layerX / this.zoom;
            let mouseY = this.center.y + layerY / this.zoom;

            this.zoom += e.deltaY * -0.005;

            let centerX = mouseX - layerX / this.zoom;
            let centerY = mouseY - layerY / this.zoom;

            this.center.set(centerX, centerY);
        });
    }

    _initializeTicker() {
        this._app.ticker.add(delta => {
            this.currentTime += delta * 1000 / 60 * this._speed;

            this._update(this.currentTime);
        });
    }
    // endregion

    // region Properties
    get isPlaying() {
        return this._isPlaying;
    }

    set isPlaying(value) {
        value = Boolean(value);

        this._isPlaying = value;

        if (this._isPlaying) {
            this._app.start();
        }
        else {
            this._app.stop();
        }

        this.emit('playStateChange');
    }

    get currentTime() {
        return this._currentTime;
    }

    set currentTime(value) {
        value = Number(value);
        if (isNaN(value)) return;

        if (value < 0) value = 0;
        else if (value > this.duration) value = this.duration;

        if (this._currentTime === value) return;

        this._currentTime = value;

        if (!this.isPlaying) {
            this._forceRender();
        }

        this.emit('currentTimeChange');
    }

    get duration() {
        return this._data.game.duration;
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
        if (value < 1) {
            value = 1;
        }

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
    // endregion

    // region Private methods
    _update(elapsedTime) {
        this._components.forEach(component => component.update(elapsedTime));
        this._attacks.forEach(component => component.update(elapsedTime));
        this._tooltips.forEach(tooltip => tooltip.update(elapsedTime));
        this._uis.forEach(ui => ui.update(elapsedTime));
    }

    _forceRender() {
        this._update(this.currentTime);
        this._app.render();
    }

    // On width, height, zoom, center change
    _invalidate() {
        if (!this._isLoaded) return;

        this._background.width = this.width * this.zoom;
        this._background.height = this.height * this.zoom;

        let x = (this.center.x / this.gameWidth * this.zoom - 0.5) * this.width;
        let y = (this.center.y / this.gameWidth * this.zoom - 0.5) * this.height;

        this._zoomLayer.position.set(-x, -y);

        if (!this.isPlaying) {
            this._forceRender();
        }
    }
    // endregion

    // region Public methods
    mount(parent) {
        parent.appendChild(this._app.view);
    }

    start() {
        this.isPlaying = true;
    }

    stop() {
        this.isPlaying = false;
    }
    // endregion
}

export { Minimap };

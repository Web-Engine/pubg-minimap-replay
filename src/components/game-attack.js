import { Container, Graphics } from 'pixi.js';
import Shape from '../shape';
import { calcPointRatio, _calcRatio } from '../utils';

class GameAttack extends Container {
    constructor(minimap, data) {
        super(minimap);

        this._data = data;
        this._minimap = minimap;

        switch (data.type)
        {
            case 'line':
                this._line = new Graphics();
                this.addChild(this._line);
                break;

            case 'bullet':
                this._bullet = new Shape();
                this._bullet.draw(data.shape);
                this.addChild(this._bullet);
                break;
        }

        // data.type
        //
        // data.attacker
        // data.attacker.x
        // data.attacker.y
        //
        // data.target
        // data.target.x
        // data.target.y
        //
        // data.duration
        // data.fixDuration
        //
        // data.elapsedTime
        // data.shape
    }

    update(currentTime) {
        let { type, attacker, target, shape, elapsedTime, duration, fixDuration } = this._data;

        if (fixDuration) {
            duration *= this._minimap.speed;
        }

        if (currentTime < elapsedTime || elapsedTime + duration < currentTime) {
            this.visible = false;
            return;
        }

        this.visible = true;

        switch (type) {
        case 'line': {
            this._line.clear();
            this._line.lineStyle(shape.lineWidth, shape.lineColor, shape.lineAlpha);
            this._line.moveTo(attacker.x * this.scaleX, attacker.y * this.scaleY);
            this._line.lineTo(target.x * this.scaleX, target.y * this.scaleY);
            break;
        }

        case 'bullet': {
            let ratio = _calcRatio(elapsedTime, elapsedTime + duration, currentTime);
            let { x, y } = calcPointRatio(attacker, target, ratio);

            this._bullet.position.set(x * this.scaleX, y * this.scaleY);
            break;
        }
        }
    }

    toScaledPoint({ x, y } = {}) {
        x *= this.scaleX;
        y *= this.scaleY;

        return { x, y };
    }

    get scaleX() {
        return this._minimap.width * this._minimap.zoom / this._minimap.gameWidth;
    }

    get scaleY() {
        return this._minimap.height * this._minimap.zoom / this._minimap.gameWidth;
    }
}

export default GameAttack;

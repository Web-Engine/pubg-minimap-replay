import { Graphics } from 'pixi.js';
import Component from './component';
import { findCurrentState } from '../utils';

class WhiteCircle extends Component {
    constructor(minimap, data) {
        super(minimap);

        this._data = data;
        this._radius = 0;

        let circle = new Graphics();
        circle.lineStyle(15, 0xFFFFFF, 1);
        circle.drawCircle(0, 0, 0);

        this._circle = circle;

        this.addChild(circle);
    }

    get radius() {
        return this._radius;
    }

    set radius(value) {
        if (this._radius === value) return;

        this._radius = value;

        this._circle.clear();

        this._circle.lineStyle(2, 0xFFFFFF, 1);
        this._circle.drawCircle(0, 0, value);
    }

    seek(time) {
        let { before } = findCurrentState(this._data, time);
        if (!before) return;

        let { location, radius } = before;

        let { x, y } = this.toScaledPoint(location);
        let scaledRadius = this.toScaledValue(radius);

        this.position.set(x, y);
        this.radius = scaledRadius;
    }
}

export default WhiteCircle;

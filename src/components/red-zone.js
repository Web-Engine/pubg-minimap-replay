import { Graphics } from 'pixi.js';
import Component from './component';
import { findCurrentState } from '../utils';

class RedZone extends Component {
    constructor(minimap, data) {
        super(minimap);

        this._data = data;
        this._radius = 0;

        let circle = new Graphics();
        circle.beginFill(0xFF3333, 0.5);
        circle.drawCircle(0, 0, 0);
        circle.endFill();

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

        this._circle.beginFill(0xFF3333, 0.5);
        this._circle.drawCircle(0, 0, value);
        this._circle.endFill();
    }

    seek(time) {
        let { before } = findCurrentState(this._data, time);

        if (!before) {
            this.position.set(-1000, -1000);
            this.radius = 0;
            return;
        }

        let { location, radius } = before;

        let { x, y } = this.toScaledPoint(location);
        let scaledRadius = this.toScaledValue(radius);

        this.position.set(x, y);
        this.radius = scaledRadius;
    }
}

export default RedZone;

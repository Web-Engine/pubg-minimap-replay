import { Graphics } from 'pixi.js';
import Component from './component';
import { calcValueRatio, calcPointRatio } from '../utils';

class SafetyZone extends Component {
    constructor(minimap, data) {
        super(minimap);

        this.registerTimeData('safetyZone', data);
        this._radius = 0;

        let circle = new Graphics();
        circle.lineStyle(2, 0x3333FF, 1);
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
        this._circle.drawCircle(0, 0, value);
    }

    update() {
        let { before, after, ratio } = this.current('safetyZone');

        if (!before) {
            this.position.set(-1000, -1000);
            this.radius = 0;
            return;
        }

        if (!after) {
            let { x, y } = this.toScaledPoint(before.location);

            this.position.set(x, y);
            this.radius = this.toScaledValue(before.radius);
            return;
        }

        let point = calcPointRatio(before.location, after.location, ratio);
        let { x, y } = this.toScaledPoint(point);

        let radius = calcValueRatio(before.radius, after.radius, ratio);
        let scaledRadius = this.toScaledValue(radius);

        this.position.set(x, y);
        this.radius = scaledRadius;
    }
}

export default SafetyZone;

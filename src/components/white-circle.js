import { Graphics } from 'pixi.js';
import Component from './component';

class WhiteCircle extends Component {
    constructor(minimap, data) {
        super(minimap);

        this.registerTimeData('whiteCircle', data);
        this._radius = 0;

        let circle = new Graphics();
        circle.lineStyle(2, 0xFFFFFF, 1);
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
        let { before } = this.current('whiteCircle');

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

export default WhiteCircle;

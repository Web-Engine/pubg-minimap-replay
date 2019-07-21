import { Graphics } from 'pixi.js'
import Component from './component';
import { findCurrentState } from "../utils";

class SafetyZone extends Component {
    constructor(data) {
        super();

        this._data = data;
        this._radius = 0;

        let circle = new Graphics();
        circle.lineStyle(15, 0x3333FF, 1);
        circle.drawCircle(0, 0, 0);

        this._circle = circle;

        this.addChild(circle);
    }

    get radius() {
        return this._radius;
    }

    set radius(value) {
        this._radius = value;

        this._circle.clear();

        this._circle.lineStyle(2, 0x3333FF, 1);
        this._circle.drawCircle(0, 0, value);
    }

    seek(time) {
        if (!this.root) return;

        let { before, after, ratio } = findCurrentState(this._data, time);
        if (!before) return;

        if (!after) {
            this.position.set(before.location.x * this.root.size, before.location.y * this.root.size);
            this.radius = before.radius * this.root.size;
            return;
        }

        let x = before.location.x * ratio + after.location.x * (1 - ratio);
        let y = before.location.y * ratio + after.location.y * (1 - ratio);
        let radius = before.radius * ratio + after.radius * (1 - ratio);

        this.position.set(x * this.root.size, y * this.root.size);
        this.radius = radius * this.root.size;
    }
}

export default SafetyZone;

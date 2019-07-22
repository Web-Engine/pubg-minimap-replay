import { Graphics } from 'pixi.js';
import Component from './component';
import { findCurrentState } from '../utils';

class WhiteCircle extends Component {
    constructor(data) {
        super();

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
        this._radius = value;

        this._circle.clear();

        this._circle.lineStyle(2, 0xFFFFFF, 1);
        this._circle.drawCircle(0, 0, value);
    }

    seek(time) {
        if (!this.root) return;

        let { before } = findCurrentState(this._data, time);
        if (!before) return;

        this.position.set(before.location.x * this.root.size, before.location.y * this.root.size);
        this.radius = before.radius * this.root.size;
    }
}

export default WhiteCircle;

import { Graphics } from 'pixi.js'
import Component from './component';
import { findCurrentState } from "../utils";

class RedZone extends Component {
    constructor(data) {
        super();

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
        this._radius = value;

        this._circle.clear();

        this._circle.beginFill(0xFF3333, 0.5);
        this._circle.drawCircle(0, 0, value);
        this._circle.endFill();
    }

    seek(time) {
        if (!this.root) return;

        let { before } = findCurrentState(this._data, time);
        if (!before) return;

        this.position.set(before.location.x * this.root.size, before.location.y * this.root.size);
        this.radius = before.radius * this.root.size;
    }
}

export default RedZone;

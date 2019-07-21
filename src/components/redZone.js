import { Graphics } from 'pixi.js'
import { findCurrentState } from "../utils";

class RedZone extends Graphics {
    constructor(data) {
        super();

        this._data = data;
        this._radius = 0;

        this.beginFill(0xFF3333, 0.5);
        this.drawCircle(0, 0, 0);
        this.endFill();
    }

    get radius() {
        return this._radius;
    }

    set radius(value) {
        this._radius = value;

        this.clear();

        this.beginFill(0xFF3333, 0.5);
        this.drawCircle(0, 0, value);
        this.endFill();
    }

    seek(time) {
        let { before } = findCurrentState(this._data, time);
        if (!before) return;

        this.position.set(before.location.x, before.location.y);
        this.radius = before.radius;
    }
}

export default RedZone;

import { Graphics } from 'pixi.js'
import { findCurrentState } from "../utils";

class WhiteCircle extends Graphics {
    constructor(data) {
        super();

        this._data = data;
        this._radius = 0;

        this.lineStyle(15, 0xFFFFFF, 1);
        this.drawCircle(0, 0, 0);
    }

    get radius() {
        return this._radius;
    }

    set radius(value) {
        this._radius = value;

        this.clear();

        this.lineStyle(15, 0xFFFFFF, 1);
        this.drawCircle(0, 0, value);
    }

    seek(time) {
        let { before } = findCurrentState(this._data, time);
        if (!before) return;

        this.position.set(before.position.x, before.position.y);
        this.radius = before.radius;
    }
}

export default WhiteCircle;

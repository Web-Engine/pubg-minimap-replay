import { Graphics } from 'pixi.js'
import { findCurrentState } from "../utils";

class SafetyZone extends Graphics {
    constructor(data) {
        super();

        this._data = data;
        this._radius = 0;

        this.lineStyle(15, 0x3333FF, 1);
        this.drawCircle(0, 0, 0);
    }

    get radius() {
        return this._radius;
    }

    set radius(value) {
        this._radius = value;

        this.clear();

        this.lineStyle(2, 0x3333FF, 1);
        this.drawCircle(0, 0, value);
    }

    seek(time) {
        let { before, after, ratio } = findCurrentState(this._data, time);
        if (!before) return;

        if (!after) {
            this.position.set(before.location.x, before.location.y);
            this.radius = before.radius;
            return;
        }

        let x = before.location.x * ratio + after.location.x * (1 - ratio);
        let y = before.location.y * ratio + after.location.y * (1 - ratio);
        let radius = before.radius * ratio + after.radius * (1 - ratio);

        this.position.set(x, y);
        this.radius = radius;
    }
}

export default SafetyZone;

import { Graphics } from 'pixi.js'
import { findCurrentState } from "../utils";

class WhiteCircle extends Graphics {
    constructor(minimap, data) {
        super();

        this._minimap = minimap;
        this._data = data;
        this._radius = 0;

        this.lineStyle(15, 0xFFFFFF, 1);
        this.drawCircle(0, 0, 0);

        minimap.on('zoomChange', () => {
            this.radius = this.radius;
        });
    }

    get radius() {
        return this._radius;
    }

    set radius(value) {
        this._radius = value;

        this.clear();

        this.lineStyle(15 / this._minimap.zoom, 0xFFFFFF, 1);
        this.drawCircle(0, 0, value);
    }

    seek(time) {
        let { before } = findCurrentState(this._data, time);
        if (!before) return;

        this.position.set(before.location.x, before.location.y);
        this.radius = before.radius;
    }
}

export default WhiteCircle;

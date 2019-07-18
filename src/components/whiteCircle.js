import { Graphics } from 'pixi.js'

class WhiteCircle extends Graphics {
    constructor() {
        super();

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
}

export default WhiteCircle;

import { Graphics } from 'pixi.js'

class RedZone extends Graphics {
    constructor() {
        super();

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
}

export default RedZone;

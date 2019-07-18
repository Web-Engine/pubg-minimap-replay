import { Graphics } from 'pixi.js'

class RedZone extends Graphics {
    constructor(x ,y, radius) {
        super();

        this.beginFill(0xFF3333, 0.5);
        this.drawCircle(x, y, radius);
        this.endFill();
    }

    resizeCircle(radius) {
        this.clear();

        this.beginFill(0xFF3333, 0.5);
        this.drawCircle(0, 0, radius);
        this.endFill();
    }
}

export default RedZone;
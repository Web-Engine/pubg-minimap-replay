import { Graphics, Text } from 'pixi.js'

class SafetyZone extends Graphics {
    constructor(x ,y, radius) {
        super();

        this.lineStyle(2, 0x3333FF, 1);
        this.drawCircle(x, y, radius);
    }

    resizeCircle(radius) {
        this.clear();

        this.lineStyle(2, 0x3333FF, 1);
        this.drawCircle(0, 0, radius);
    }
}

export default SafetyZone;
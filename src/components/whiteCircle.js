import { Graphics } from 'pixi.js'

class WhiteCircle extends Graphics {
    constructor(x ,y, radius) {
        super();

        this.lineStyle(15, 0xFFFFFF, 1);
        this.drawCircle(x, y, radius);
    }

    resizeCircle(radius) {
        this.clear();

        this.lineStyle(15, 0xFFFFFF, 1);
        this.drawCircle(0, 0, radius);
    }
}

export default WhiteCircle;

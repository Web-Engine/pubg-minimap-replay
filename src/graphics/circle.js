import { Graphics } from 'pixi.js'

class Circle extends Graphics {
    constructor(color, radius) {
        super();

        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
    }
}

export default Circle;
import { Container } from 'pixi.js';

class Component extends Container {
    constructor(minimap) {
        super();

        this.minimap = minimap;
    }

    seek() {}

    toScaledValue(value) {
        return value * this.minimap.size * this.minimap.zoom;
    }

    toScaledPoint(point) {
        return {
            x: this.toScaledValue(point.x),
            y: this.toScaledValue(point.y),
        };
    }
}

export default Component;

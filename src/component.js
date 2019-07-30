import { Container } from 'pixi.js';
import { calcPointRatio } from './utils';
import TimeData from './time-data';

class Component extends Container {
    constructor(minimap, locations) {
        super();

        this._minimap = minimap;
        this._locations = new TimeData(locations);
    }

    update(elapsedTime) {
        this._locations.seek(elapsedTime);

        let { before, after, ratio } = this._locations;

        if (!before) {
            this.x = -Infinity;
            this.y = -Infinity;
            return;
        }

        if (!after || !after.transition) {
            let { x, y } = this.toScaledPoint(before);
            this.position.set(x, y);
            return;
        }

        let location = calcPointRatio(before, after, ratio);
        let { x, y } = this.toScaledPoint(location);

        this.position.set(x, y);
    }

    toScaledPoint({ x, y } = {}) {
        x = this.toScaledValue(x);
        y = this.toScaledValue(y);

        return { x, y };
    }

    toScaledValue(value) {
        return value / this._minimap.gameWidth * this._minimap.width * this._minimap.zoom;
    }
}

export default Component;

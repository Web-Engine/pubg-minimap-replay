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
            this.emit('positionChange');
            return;
        }

        if (!after || !after.transition) {
            let { x, y } = this.toScaledPoint(before);
            this.position.set(x, y);
            this.emit('positionChange');
            return;
        }

        let location = calcPointRatio(before, after, ratio);
        let { x, y } = this.toScaledPoint(location);

        this.position.set(x, y);
        this.emit('positionChange');
    }

    toScaledPoint({ x, y } = {}) {
        x *= this.scaleX;
        y *= this.scaleY;

        return { x, y };
    }

    get scaleX() {
        return this._minimap.width * this._minimap.zoom / this._minimap.gameWidth;
    }

    get scaleY() {
        return this._minimap.height * this._minimap.zoom / this._minimap.gameWidth;
    }
}

export default Component;

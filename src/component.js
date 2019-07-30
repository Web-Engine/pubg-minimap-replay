import { Container } from 'pixi.js';
import { calcValueRatio } from './utils';
import TimeData from './time-data';

class Component extends Container {
    constructor(locations) {
        super();

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

        if (!after) {
            this.position.set(before.x, before.y);
            return;
        }

        let { x: beforeX, y: beforeY } = before;
        let { x: afterX, y: afterY } = after;

        let x = calcValueRatio(beforeX, afterX, ratio);
        let y = calcValueRatio(beforeY, afterY, ratio);

        this.position.set(x, y);
    }
}

export default Component;

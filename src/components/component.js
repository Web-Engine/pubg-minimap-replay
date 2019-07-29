import { Container } from 'pixi.js';
import { calcRatio, findCurrentState } from '../utils';

class TimeData {
    constructor(data) {
        this._data = data;
        this.index = -1;
        this._ratio = NaN;
    }

    seek(time) {
        let { ratio, beforeIndex } = findCurrentState(this._data, time);

        this.index = beforeIndex;
        this._ratio = ratio;
    }

    next(time) {
        while (this.after && this.after.elapsedTime < time) {
            this.index++;
        }

        this._ratio = calcRatio(this.before, this.after, time);
    }

    get before() {
        return this._data[this.index];
    }

    get after() {
        return this._data[this.index + 1];
    }

    get ratio() {
        return this._ratio;
    }
}

class Component extends Container {
    constructor(minimap) {
        super();

        this.minimap = minimap;

        this._timeData = {};
    }

    seek(time) {
        for (let name in this._timeData) {
            if (!Object.prototype.hasOwnProperty.call(this._timeData, name)) continue;

            this._timeData[name].seek(time);
        }

        this.update(time);
    }

    next(time) {
        for (let name in this._timeData) {
            if (!Object.prototype.hasOwnProperty.call(this._timeData, name)) continue;

            this._timeData[name].next(time);
        }

        this.update(time);
    }

    update() {}

    registerTimeData(name, data) {
        this._timeData[name] = new TimeData(data);
    }

    current(name) {
        return this._timeData[name];
    }

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

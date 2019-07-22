import * as PIXI from 'pixi.js'

class ObservablePoint extends PIXI.utils.EventEmitter {
    constructor(x = 0, y = 0) {
        super();

        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;

        this.emit('change');
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;

        this.emit('change');
    }

    set(x, y) {
        this._x = x;
        this._y = y;

        this.emit('change');
    }
}

export default ObservablePoint;
import { Container, Text } from 'pixi.js';
import TimeData from './time-data';
import Shape from './shape';
import { calcValueRatio } from './utils';

class GameUI extends Container {
    constructor(data) {
        super();

        this._positions = new TimeData(data.positions);
        this._shapes = new TimeData(data.shapes);
        this._shape = new Shape();

        this.addChild(this._shape);

        this._texts = new TimeData(data.texts);

        this._text = new Text('');
        this._text.anchor.set(0.5, 0.5);

        this.addChild(this._text);
    }

    update(elapsedTime) {
        this._positions.seek(elapsedTime);
        this._shapes.seek(elapsedTime);
        this._texts.seek(elapsedTime);

        this._setPosition();
        this._drawShape();
        this._drawText();
    }

    _setPosition() {
        let { before, after, ratio } = this._positions;

        if (!before) {
            this.visible = false;
            return;
        }

        this.visible = true;

        if (!after || !after.transition) {
            this.position.set(before.x, before.y);
            return;
        }

        let { x: beforeX, y: beforeY } = before;
        let { x: afterX, y: afterY } = after;

        let x = calcValueRatio(beforeX, afterX, ratio);
        let y = calcValueRatio(beforeY, afterY, ratio);

        this.position.set(x, y);
    }

    _drawShape() {
        let { before, after, ratio } = this._shapes;

        this._shape.draw(before, after, ratio);
    }

    _drawText() {
        let { before } = this._texts;

        if (!before) {
            this._texts.visible = false;
            return;
        }

        this._texts.visible = true;

        let { text, textColor, textAlpha, textSize } = before;

        this._text.text = text;
        this._text.style.fill = textColor;
        this._text.style.fillAlpha = textAlpha;
        this._text.style.fontSize = textSize;

        this._text.position.set(this._shape.width / 2, this._shape.height / 2);
    }
}

export default GameUI;

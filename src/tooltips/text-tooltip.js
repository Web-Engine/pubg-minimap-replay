import Tooltip from './tooltip';
import { Text } from 'pixi.js'

class TextTooltip extends Tooltip {
    constructor(text) {
        super(new Text(text, {
            fill: 0xFFFFFF,
            fontSize: 16,
        }));

        this._text = text;
    }

    get text() {
        return this._content.text;
    }

    set text(value) {
        this._content.text = value;

        super.invalidate();
    }
}

export default TextTooltip;

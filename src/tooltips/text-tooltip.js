import Tooltip from './tooltip';
import { Text } from 'pixi.js'

class TextTooltip extends Tooltip {
    constructor(text) {
        super(new Text(text, {
            fill: 0xFFFFFF,
            fontSize: 14,
        }));
    }

    get text() {
        return this._content.text;
    }

    set text(value) {
        if (this.text === value) return;

        this._content.text = value;
        this.invalidate();
    }
}

export default TextTooltip;

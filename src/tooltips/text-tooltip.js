import Tooltip from './tooltip';
import TimeData from './../time-data';
import { Text } from 'pixi.js'

class TextTooltip extends Tooltip {
    constructor(data) {
        super(new Text('', {
            fill: 0xFFFFFF,
            fontSize: 12,
        }));

        this._tooltips = new TimeData(data);
    }

    update(elapsedTime) {
        this._tooltips.seek(elapsedTime);

        let { before } = this._tooltips;

        if (!before) {
            this._content.text = '';
            this.invalidate();
            return;
        }

        this._content.text = before.text;

        this.invalidate();
    }
}

export default TextTooltip;

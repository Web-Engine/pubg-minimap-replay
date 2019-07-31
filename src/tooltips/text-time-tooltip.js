import TextTooltip from './text-tooltip';
import TimeData from './../time-data';

class TextTimeTooltip extends TextTooltip {
    constructor(data) {
        super('');

        this._tooltips = new TimeData(data);
    }

    update(elapsedTime) {
        this._tooltips.seek(elapsedTime);

        let { before } = this._tooltips;

        if (!before) {
            this.text = '';
            return;
        }

        this.text = before.text;
    }
}

export default TextTimeTooltip;

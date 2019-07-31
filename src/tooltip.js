import { Container, Graphics, Text } from 'pixi.js';

class Tooltip extends Container {
    constructor() {
        super();

        this._target = null;
        this._onPositionChange = null;

        this._text = new Text('tooltip\nhello\ntooltip\nhello\ntooltip\nhello', {
            fill: 0xFFFFFF,
            fontSize: 16,
        });
        this._text.anchor.set(0.5, 1);
        this._text.position.set(0, -5);

        let { width, height } = this._text;
        width += 10;
        height += 10;

        this._box = new Graphics();
        this._box.lineStyle(1, 0xFFFFFF, 0.8);
        this._box.beginFill(0x000000, 0.8);
        this._box.drawRoundedRect(-width / 2, -height, width, height, 4);
        this._box.endFill();

        this.addChild(this._box);
        this.addChild(this._text);
    }

    disconnect() {
        if (!this._target) return;

        this._target.off('positionChange', this._onPositionChange);

        this._target = null;
        this._onPositionChange = null;
    }

    connect(component) {
        this.disconnect();

        this._target = component;
        this._onPositionChange = () => {
            let { x, y } = component.position;
            this.position.set(x, y - component.height / 2 - 10);
        };

        component.on('positionChange', this._onPositionChange);
        this._onPositionChange();
    }
}

export default Tooltip;

import { Container, Graphics } from 'pixi.js';

class Tooltip extends Container {
    constructor(content) {
        super();

        this._target = null;
        this._onPositionChange = null;

        this._content = content;

        this._box = new Graphics();
        this.invalidate();

        this.addChild(this._box);
        this.addChild(this._content);
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

    invalidate() {
        this._content.position.set(-this._content.width / 2, - 5 - this._content.height);

        let { width, height } = this._content;
        width += 10;
        height += 10;

        this._box.clear();
        this._box.lineStyle(1, 0xFFFFFF, 0.8);
        this._box.beginFill(0x000000, 0.8);
        this._box.drawRoundedRect(-width / 2, -height, width, height, 4);
        this._box.endFill();
    }
}

export default Tooltip;

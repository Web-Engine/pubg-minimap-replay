import { Container, Graphics, Text } from 'pixi.js';

class Button extends Container {
    constructor({
        text = null,
        width = 30,
        height = 30,
        textSize = 16,
        textColor = 0xFFFFFF,
        backgroundColor = 0x565656,
        backgroundAlpha = 0.9,
    } = {}) {
        super();

        this.interactive = true;
        this.buttonMode = true;

        let background = new Graphics();
        background.lineStyle(1,0xffffff);
        background.beginFill(backgroundColor, backgroundAlpha);
        background.drawRect(0, 0, width, height);
        background.endFill();
        this.addChild(background);

        let textView = new Text(text, { fontSize: textSize, fill: textColor });
        textView.anchor.set(0.5, 0.5);
        textView.position.set(width / 2, height / 2);

        this.textView = textView;
        this.addChild(textView);
    }

    get text() {
        return this.textView.text;
    }

    set text(value) {
        this.textView.text = value;
    }
}

export default Button;

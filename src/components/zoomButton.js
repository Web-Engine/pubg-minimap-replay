import { Container, Graphics } from 'pixi.js';

class ZoomButtonUI extends Container {
    constructor() {
        super();

        let expandButton = new Graphics();
        expandButton.beginFill(0x565656, 0.8);
        expandButton.drawRect(0, 0, 30, 30);
        expandButton.endFill();
        expandButton.interactive = true;
        expandButton.buttonMode = true;

        let contractButton = new Graphics();
        contractButton.beginFill(0x565656, 0.8);
        contractButton.drawRect(40, 0, 30, 30);
        contractButton.endFill();
        contractButton.interactive = true;
        contractButton.buttonMode = true;

        this.addChild(expandButton);
        this.addChild(contractButton);

        expandButton.on('click', () => {
            this.emit('expand');
        });

        contractButton.on('click', () => {
            this.emit('contract');
        });
    }
}

export default ZoomButtonUI;

import { Container, Text, Graphics } from 'pixi.js';
import Button from './button';

class ZoomControllerUI extends Container {
    constructor(minimap) {
        super();

        this.minimap = minimap;

        let expandButton = new Button({ text: '+' });
        let contractButton = new Button({ text: '-' });
        let zoomDisplayBox = new Graphics();
        let zoomDisplayText = new Text('1.0x', { fontSize: 13, fill: 0xffffff });

        zoomDisplayBox.lineStyle(1, 0xffffff);
        zoomDisplayBox.beginFill(0x939393, 0.9);
        zoomDisplayBox.drawRect(30, 0, 40, 30);
        zoomDisplayBox.endFill();

        zoomDisplayText.anchor.set(0.5, 0.5);

        expandButton.position.set(0, 0);
        contractButton.position.set(70, 0);
        zoomDisplayText.position.set(50, 15);

        this.addChild(expandButton);
        this.addChild(contractButton);
        this.addChild(zoomDisplayBox);
        this.addChild(zoomDisplayText);

        expandButton.on('click', () => {
            this.emit('expand');
        });

        contractButton.on('click', () => {
            this.emit('contract');
        });

        minimap.on('zoomChange', () => {
            zoomDisplayText.text = minimap.zoom.toFixed(1) + 'x';
        });
    }
}

export default ZoomControllerUI;

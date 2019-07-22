import { Container } from 'pixi.js';
import Button from './button';

class ZoomControllerUI extends Container {
    constructor() {
        super();

        let expandButton = new Button({ text: '+' });
        let contractButton = new Button({ text: '-' });

        expandButton.position.set(0, 0);
        contractButton.position.set(40, 0);

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

export default ZoomControllerUI;

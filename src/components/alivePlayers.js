import { Container, Text, Graphics } from 'pixi.js';
import { findCurrentState } from '../utils';

class AlivePlayerUI extends Container {
    constructor(data) {
        super();

        this._data = data;

        let leftBox = new Graphics();
        leftBox.beginFill(0xa1a1a1, 0.7);
        leftBox.drawRect(0, 0, 50, 40);
        leftBox.endFill();

        let rightBox = new Graphics();
        rightBox.beginFill(0x424242, 0.7);
        rightBox.drawRect(50, 0, 100, 40);
        rightBox.endFill();

        let numAlivePlayers = 100;
        if (this._data.length !== 0) {
            numAlivePlayers = this._data[0].numAlivePlayers;
        }

        let numAlivePlayerText = new Text(numAlivePlayers, { fontSize: 26, fill: 0xeeeeee });
        numAlivePlayerText.anchor.set(0.5, 0.5);
        numAlivePlayerText.position.set(25, 20);

        let aliveText = new Text('ALIVE', { fontSize: 26, fill: 0xa1a1a1 });
        aliveText.anchor.set(0.5, 0.5);
        aliveText.position.set(100, 20);

        this.leftBox = leftBox;
        this.rightBox = rightBox;
        this.numAlivePlayerText = numAlivePlayerText;
        this.alivePlayersText = aliveText;

        this.addChild(leftBox);
        this.addChild(rightBox);
        this.addChild(numAlivePlayerText);
        this.addChild(aliveText);
    }

    seek(time) {
        let { before } = findCurrentState(this._data, time);
        if (!before) return;

        this.numAlivePlayerText.text = before.numAlivePlayers;
    }
}

export default AlivePlayerUI;

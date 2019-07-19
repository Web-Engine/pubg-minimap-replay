import { Container, Text, Graphics } from 'pixi.js'
import { findCurrentState } from "../utils";

class NumAlivePlayers extends Container {
    constructor(data) {
        super();

        this._data = data;

        let numAlivePlayersBox = new Graphics();
        numAlivePlayersBox.beginFill(0xa1a1a1, 0.7);
        numAlivePlayersBox.drawRect(0,0, 600, 600);
        numAlivePlayersBox.endFill();
        this.addChild(numAlivePlayersBox);

        let numAlivePlayers = new Text(String(data[0].numAlivePlayers), { fontSize: 300, fill: 0xcfcfcf});
        numAlivePlayers.anchor.set(0.5, 0.5);
        numAlivePlayers.position.set(this.width / 2, this.height / 2);
        this.addChild(numAlivePlayers);

        this._numAlivePlayers = numAlivePlayers;

        this.position.set(250, 250);
    }

    seek(time) {
        let { before, after } = findCurrentState(this._data, time);

        let numAlivePlayers;
        if(!before) {
            numAlivePlayers = after.numAlivePlayers;
        }
        else {
            numAlivePlayers = before.numAlivePlayers;
        }
        this._numAlivePlayers.text = String(numAlivePlayers);
    }
}

class AlivePlayersText extends Container {
    constructor() {
        super ();

        let alivePlayersTextBox = new Graphics();
        alivePlayersTextBox.beginFill(0x424242, 0.7);
        alivePlayersTextBox.drawRect(0, 0, 1100, 600);
        alivePlayersTextBox.endFill();
        this.addChild(alivePlayersTextBox);

        let text = new Text('ALIVE', { fontSize: 300, fill:0xa1a1a1 });
        text.anchor.set(0.5, 0.5);
        text.position.set(this.width / 2, this.height / 2);
        this.addChild(text);

        this.position.set(850, 250);
    }
}

export {
    NumAlivePlayers,
    AlivePlayersText,
};

import { Container, Text } from 'pixi.js'
import Circle from './../graphics/circle'

class Player extends Container {
    constructor(playerName, teamId) {
        super();

        this._circle = new Circle(0xFFFFFF, 70);
        this.addChild(this._circle);

        this._text = new Text(String(teamId), { fontSize: 100 });
        this._text.anchor.x = 0.5;
        this._text.anchor.y = 0.5;
        this.addChild(this._text);
    }
}

export default Player;
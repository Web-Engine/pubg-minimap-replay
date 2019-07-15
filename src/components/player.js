import { Container, Text, Graphics } from 'pixi.js'

class Player extends Container {
    constructor(playerName, teamId) {
        super();

        let backgroundCircle = new Graphics();
        backgroundCircle.beginFill(0xFFFFFF);
        backgroundCircle.drawCircle(0, 0, this.size);
        backgroundCircle.endFill();
        this.addChild(backgroundCircle);

        let text = new Text(String(teamId), { fontSize: 100 });
        text.anchor.set(0.5, 0.5);

        this.addChild(text);
    }

    get size() {
        return 70;
    }
}

export default Player;
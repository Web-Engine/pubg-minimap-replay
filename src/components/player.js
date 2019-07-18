import { Container, Text, Graphics } from 'pixi.js'

class Player extends Container {
    constructor(data) {
        super();

        this.name = data.name;
        this.accountId = data.accountId;
        this.positions = data.positions;

        let backgroundCircle = new Graphics();
        backgroundCircle.lineStyle(5);
        backgroundCircle.beginFill(0xFFFFFF);
        backgroundCircle.drawCircle(0, 0, 100);
        backgroundCircle.endFill();
        this.addChild(backgroundCircle);

        let text = new Text(String(data.teamId), { fontSize: 130 });
        text.anchor.set(0.5, 0.5);

        this.addChild(text);
    }
}

export default Player;

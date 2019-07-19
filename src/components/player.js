import { Container, Text, Graphics } from 'pixi.js'
import { findCurrentState } from "../utils";

class Player extends Container {
    constructor(minimap, data) {
        super();

        this._minimap = minimap;
        this.data = data;
        this.name = data.name;
        this.accountId = data.accountId;
        this.locations = data.locations;

        let backgroundCircle = new Graphics();
        this.addChild(backgroundCircle);

        backgroundCircle.lineStyle(5);
        backgroundCircle.beginFill(0xFFFFFF);
        backgroundCircle.drawCircle(0, 0, 100);
        backgroundCircle.endFill();

        let text = new Text(String(data.teamId), { fontSize: 130 });
        text.anchor.set(0.5, 0.5);

        this.addChild(text);

        minimap.on('zoomChange', factor => {
            backgroundCircle.clear();
            backgroundCircle.lineStyle(5 / factor);
            backgroundCircle.beginFill(0xFFFFFF);
            backgroundCircle.drawCircle(0, 0, 100 / factor);
            backgroundCircle.endFill();

            text.style = { fontSize: 130 / factor };
        });
    }

    seek(time) {
        let { before, after, ratio } = findCurrentState(this.locations, time);

        if (!before) {
            this.x = -1000;
            this.y = -1000;
            return;
        }

        if (!after) {
            this.x = before.location.x;
            this.y = before.location.y;
            return;
        }

        let x = before.location.x * ratio + after.location.x * (1 - ratio);
        let y = before.location.y * ratio + after.location.y * (1 - ratio);

        this.position.set(x, y);
    }
}

export default Player;

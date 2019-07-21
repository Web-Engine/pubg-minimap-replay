import { Text, Graphics } from 'pixi.js';
import { findCurrentState } from '../utils';
import Component from './component';

class Player extends Component {
    constructor(data) {
        super();

        this.data = data;
        this.name = data.name;
        this.accountId = data.accountId;
        this.locations = data.locations;

        let backgroundCircle = new Graphics();
        this.addChild(backgroundCircle);

        backgroundCircle.lineStyle(1);
        backgroundCircle.beginFill(0xFFFFFF);
        backgroundCircle.drawCircle(0, 0, 10);
        backgroundCircle.endFill();

        let text = new Text(String(data.teamId), { fontSize: 12 });
        text.anchor.set(0.5, 0.5);

        this.addChild(text);
    }

    seek(time) {
        if (!this.root) return;

        let { before, after, ratio } = findCurrentState(this.locations, time);

        if (!before) {
            this.x = -1000;
            this.y = -1000;
            return;
        }

        if (!after) {
            this.x = before.location.x * this.root.size;
            this.y = before.location.y * this.root.size;
            return;
        }

        let x = before.location.x * ratio + after.location.x * (1 - ratio);
        let y = before.location.y * ratio + after.location.y * (1 - ratio);

        this.position.set(x * this.root.size, y * this.root.size);
    }
}

export default Player;

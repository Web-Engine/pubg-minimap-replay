import { Text, Graphics } from 'pixi.js';
import { findCurrentState } from '../utils';
import Component from './component';

class Player extends Component {
    constructor(data) {
        super();

        this.data = data;
        this.name = data.name;
        this.teamId = data.teamId;
        this.accountId = data.accountId;
        this.locations = data.locations;
        this.healths = data.healths;

        this.health = 100;

        let circle = new Graphics();
        this.addChild(circle);

        circle.lineStyle(1);
        circle.beginFill(0xFFFFFF);
        circle.drawCircle(0, 0, 10);
        circle.endFill();

        this.circle = circle;

        let text = new Text(String(data.teamId), { fontSize: 12 });
        text.anchor.set(0.5, 0.5);

        this.addChild(text);
    }

    seek(time) {
        if (!this.root) return;

        {
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

        {
            let { before } = findCurrentState(this.healths, time);

            let health = 100;
            if (before) {
                health = before.health;
            }

            if (this.health === health) return;

            this.health = health;

            if (health <= 0) {
                this.circle.clear();
                this.circle.lineStyle(1);
                this.circle.beginFill(0xFF0000);
                this.circle.drawCircle(0, 0, 10);
                this.circle.endFill();
            }
            else {
                this.circle.clear();
                this.circle.lineStyle(1);
                this.circle.beginFill(0xFFFFFF);
                this.circle.drawCircle(0, 0, 10);
                this.circle.endFill();
            }
        }
    }
}

export default Player;

import { Text, Graphics } from 'pixi.js';
import { calcPointRatio, findCurrentState } from '../utils';
import Component from './component';

class Player extends Component {
    constructor(minimap, data) {
        super(minimap);

        this.data = data;
        this.name = data.name;
        this.teamId = data.teamId;
        this.accountId = data.accountId;
        this.locations = data.locations;
        this.healths = data.healths;

        let circle = new Graphics();
        this.addChild(circle);

        this.circle = circle;

        let text = new Text(String(data.teamId), { fontSize: 12 });
        text.anchor.set(0.5, 0.5);

        this.addChild(text);

        this.health = 100;
    }

    get health() {
        return this._health;
    }

    set health(value) {
        if (this._health === value) return;

        this._health = value;

        this.circle.clear();

        if (value === 0) {
            this.circle.lineStyle(1);
            this.circle.beginFill(0xFF0000);
            this.circle.drawCircle(0, 0, 10);
            this.circle.endFill();
            this.circle.lineStyle(0);
        }
        else {
            this.circle.beginFill(0xFF0000);
            this.circle.moveTo(0, 0);
            this.circle.arc(0, 0, 10, Math.PI * value / 50, Math.PI * 2);
            this.circle.endFill();

            this.circle.beginFill(0xFFFFFF);
            this.circle.moveTo(0, 0);
            this.circle.arc(0, 0, 10, 0, Math.PI * value / 50);
            this.circle.endFill();

            this.circle.lineStyle(1);
            this.circle.drawCircle(0, 0, 10);
            this.circle.lineStyle(0);
        }
    }

    seek(time) {
        {
            let { before, after, ratio } = findCurrentState(this.locations, time);

            if (!before) {
                this.x = -1000;
                this.y = -1000;
                return;
            }

            if (!after) {
                let { x, y } = this.toScaledPoint(before.location);
                this.position.set(x, y);

                return;
            }

            let location = calcPointRatio(before.location, after.location, ratio);
            let { x, y } = this.toScaledPoint(location);

            this.position.set(x, y);
        }

        {
            let { before } = findCurrentState(this.healths, time);

            let health = 100;
            if (before) {
                health = before.health;
            }

            if (this.health === health) return;

            this.health = health;
        }
    }
}

export default Player;

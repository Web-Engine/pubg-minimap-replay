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

        this.interactive = true;
        this.buttonMode = true;

        let showName = false;

        let nameText = new Text(this.name, { fontSize: 16, fill: 'white'});
        nameText.anchor.set(0.5, 0.5);
        nameText.position.set(0,-(nameText.height / 2 + 14));
        nameText.zIndex = 1;

        let nameBox = new Graphics();
        nameBox.lineStyle(0.8, 0xffffff,0.7);
        nameBox.beginFill(0x000000, 0.6);
        nameBox.drawRoundedRect(-(nameText.width / 2 + 2),-(nameText.height + 16), nameText.width + 4,nameText.height + 4, 5);
        nameBox.endFill();
        nameBox.zIndex = 1;

        this.on('click', () => {
            if(showName === false) {
                this.addChild(nameBox);
                this.addChild(nameText);
                showName = true;
            }
            else {
                this.removeChild(nameBox);
                this.removeChild(nameText);
                showName = false;
            }
        });
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
        this.updatePosition(time);
        this.updateHealth(time);
    }

    updatePosition(time) {
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

    updateHealth(time) {
        let { before } = findCurrentState(this.healths, time);

        let health = 100;
        if (before) {
            health = before.health;
        }

        this.health = health;
    }
}

export default Player;

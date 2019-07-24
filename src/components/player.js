import { Text, Graphics } from 'pixi.js';
import { calcPointRatio } from '../utils';
import Component from './component';
import { enums } from './../data';

class Player extends Component {
    constructor(minimap, data) {
        super(minimap);

        this.data = data;
        this.name = data.name;
        this.teamId = data.teamId;
        this.accountId = data.accountId;

        this.registerTimeData('location', data.locations);
        this.registerTimeData('health', data.healths);

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

        let nameText = new Text(this.name, { fontSize: 16, fill: 'white' });
        nameText.anchor.set(0.5, 0.5);
        nameText.position.set(0, -(nameText.height / 2 + 14));
        nameText.zIndex = 1;

        let nameBox = new Graphics();
        nameBox.lineStyle(0.8, 0xffffff, 0.7);
        nameBox.beginFill(0x000000, 0.6);
        nameBox.drawRoundedRect(-(nameText.width / 2 + 2), -(nameText.height + 16), nameText.width + 4, nameText.height + 4, 5);
        nameBox.endFill();
        nameBox.zIndex = 1;

        nameText.visible = false;
        nameBox.visible = false;

        this.addChild(nameBox);
        this.addChild(nameText);

        this.on('click', () => {
            showName = !showName;
            nameText.visible = showName;
            nameBox.visible = showName;
        });

        this._state = enums.PlayerState.ALIVE;

        this._nextLocationIndex = 0;
        this._nextHealthIndex = 0;

        this.redrawCircle();
    }

    get state() {
        return this._state;
    }

    set state(value) {
        if (this._state === value) return;

        this.redrawCircle();
    }

    get health() {
        return this._health;
    }

    set health(value) {
        if (this._health === value) return;

        this._health = value;

        this.redrawCircle();
    }

    redrawCircle() {
        this.circle.clear();

        switch (this.state) {
        case enums.PlayerState.ALIVE:
            this.circle.beginFill(0xFF0000);
            this.circle.moveTo(0, 0);
            this.circle.arc(0, 0, 10, Math.PI * this.health / 50, Math.PI * 2);
            this.circle.endFill();

            this.circle.beginFill(0xFFFFFF);
            this.circle.moveTo(0, 0);
            this.circle.arc(0, 0, 10, 0, Math.PI * this.health / 50);
            this.circle.endFill();

            this.circle.lineStyle(1);
            this.circle.drawCircle(0, 0, 10);
            this.circle.lineStyle(0);
            break;

        case enums.PlayerState.GROGGY:
            this.circle.lineStyle(1);
            this.circle.beginFill(0xFFFF00);
            this.circle.drawCircle(0, 0, 10);
            this.circle.endFill();
            this.circle.lineStyle(0);
            break;

        case enums.PlayerState.DEAD:
            this.circle.lineStyle(1);
            this.circle.beginFill(0xFF0000);
            this.circle.drawCircle(0, 0, 10);
            this.circle.endFill();
            this.circle.lineStyle(0);
            break;
        }
    }

    update() {
        this.updateLocation();
        this.updateHealth();
    }

    updateLocation() {
        let { before, after, ratio } = this.current('location');

        if (!before) {
            this.visible = false;
            return;
        }

        this.visible = true;

        if (!after) {
            let { x, y } = this.toScaledPoint(before.location);
            this.position.set(x, y);
            return;
        }

        let location = calcPointRatio(before.location, after.location, ratio);
        let { x, y } = this.toScaledPoint(location);

        this.position.set(x, y);
    }

    updateHealth() {
        let { before } = this.current('health');

        if (!before) {
            this.visible = false;
            return;
        }

        this.visible = true;

        this._health = before.health;
        this._state = before.state;

        this.redrawCircle();
    }
}

export default Player;

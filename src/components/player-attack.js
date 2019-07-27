import { Graphics } from 'pixi.js';
import Component from './component';

class PlayerAttack extends Component {
    constructor(minimap, data) {
        super(minimap);

        this._data = data;
        this.location = {
            x: (data.attacker.location.x + data.victim.location.x) / 2,
            y: (data.attacker.location.y + data.victim.location.y) / 2,
        };

        let playerAttack = new Graphics();
        playerAttack.lineStyle(4, 0xff0000, 1);
        playerAttack.moveTo(data.attacker.location.x, data.attacker.location.y);
        playerAttack.lineTo(data.victim.location.x, data.victim.location.y);

        this.addChild(playerAttack);
    }

    update(time) {
        let { x, y } = this.toScaledPoint(this.location);
        this.position.set(x, y);

        this.visible = (this._data.elapsedTime <= time && time <= this._data.elapsedTime + 1);
    }
}

export default PlayerAttack;

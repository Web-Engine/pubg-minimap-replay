import { Graphics } from 'pixi.js';
import Component from './component';

class PlayerAttack extends Component {
    constructor(minimap, data) {
        super(minimap);

        this._data = data;

        this.attacker = data.attacker;
        this.victim = data.victim;

        let playerAttack = new Graphics();
        this.playerAttack = playerAttack;
        this.addChild(playerAttack);
    }

    update(time) {
        this.playerAttack.clear();
        this.playerAttack.lineStyle(1, 0xff0000);

        {
            let { x, y } = this.toScaledPoint(this.attacker.location);
            this.playerAttack.moveTo(x, y);
        }

        {
            let { x, y } = this.toScaledPoint(this.victim.location);
            this.playerAttack.lineTo(x, y);
        }

        this.visible = this.minimap.zoom >= 6 && this._data.elapsedTime <= time && time <= this._data.elapsedTime + this.minimap.speed * 200;
    }
}

export default PlayerAttack;

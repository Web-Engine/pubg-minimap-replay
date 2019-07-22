import { Sprite, Texture } from 'pixi.js';
import Component from './component';
import { Icon } from './../assets';

const FlyingTexture = Texture.from(Icon.CarePackage.Flying);
const NormalTexture = Texture.from(Icon.CarePackage.Normal);

class CarePackage extends Component {
    constructor(minimap, data) {
        super(minimap);

        this._data = data;

        let sprite = new Sprite(FlyingTexture);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        this._sprite = sprite;

        this.addChild(sprite);

        this.scale.x = .2;
        this.scale.y = .2;

        this.spawnTime = data.spawnTime;
        this.landTime = data.landTime;
    }

    seek(time) {
        let { x, y } = this.toScaledPoint(this._data.spawnLocation);
        this.position.set(x, y);

        this.visible = this.spawnTime <= time;
        this._sprite.texture = this.landTime <= time ? NormalTexture : FlyingTexture;
    }
}

export default CarePackage;

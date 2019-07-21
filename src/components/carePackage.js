import { Sprite, Texture } from 'pixi.js'
import Component from './component';
import { Icon } from './../assets';

const FlyingTexture = Texture.from(Icon.CarePackage.Flying);
const NormalTexture = Texture.from(Icon.CarePackage.Normal);

class CarePackage extends Component {
    constructor(data) {
        super();

        this._data = data;

        let sprite = new Sprite(FlyingTexture);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        this.addChild(sprite);

        this.scale.x = .2;
        this.scale.y = .2;

        this.spawnTime = data.spawnTime;
        this.landTime = data.landTime;
    }

    seek(time) {
        if (!this.root) return;

        this.position.set(this._data.spawnLocation.x * this.root.size, this._data.spawnLocation.y * this.root.size);

        this.visible = this.spawnTime <= time;
        this.texture = this.landTime <= time ? NormalTexture : FlyingTexture;
    }
}

export default CarePackage;

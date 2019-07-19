import { Sprite, Texture } from 'pixi.js'
import { Icon } from './../assets';

const FlyingTexture = Texture.from(Icon.CarePackage.Flying);
const NormalTexture = Texture.from(Icon.CarePackage.Normal);

class CarePackage extends Sprite {
    constructor(data) {
        super(Texture.from(Icon.CarePackage.Flying));

        this.x = data.location.x;
        this.y = data.location.y;

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        this.scale.x = 2;
        this.scale.y = 2;

        this.spawnTime = data.spawnTime;
        this.landTime = data.landTime;
    }

    seek(time) {
        this.visible = this.spawnTime <= time;
        this.texture = this.landTime <= time ? NormalTexture : FlyingTexture;
    }
}

export default CarePackage;

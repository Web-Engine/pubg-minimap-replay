import { Sprite, Texture } from 'pixi.js'
import { Icon } from './../assets';

const FlyingTexture = Texture.from(Icon.CarePackage.Flying);
const NormalTexture = Texture.from(Icon.CarePackage.Normal);

class CarePackage extends Sprite {
    constructor(minimap, data) {
        super(Texture.from(Icon.CarePackage.Flying));

        this._minimap = minimap;

        this.x = data.location.x;
        this.y = data.location.y;

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        this.scale.x = 2 / minimap.zoomFactor;
        this.scale.y = 2 / minimap.zoomFactor;

        this.spawnTime = data.spawnTime;
        this.landTime = data.landTime;

        minimap.on('zoomChange', factor => {
            this.scale.x = 2 / factor;
            this.scale.y = 2 / factor;
        });
    }

    seek(time) {
        this.visible = this.spawnTime <= time;
        this.texture = this.landTime <= time ? NormalTexture : FlyingTexture;
    }
}

export default CarePackage;

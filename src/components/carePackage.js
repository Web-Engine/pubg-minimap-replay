import { Sprite, Texture } from 'pixi.js'
import { Icon } from './../assets';

class CarePackage extends Sprite {
    constructor(data) {
        super(Texture.from(Icon.CarePackage.Normal));

        this.x = data.location.x;
        this.y = data.location.y;

        this.spawnTime = data.spawnTime;
    }
}

export default CarePackage;

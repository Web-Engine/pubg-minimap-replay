import { Sprite, Texture, Text, Graphics } from 'pixi.js';
import Component from './component';
import { Icon } from './../assets';

const FlyingTexture = Texture.from(Icon.CarePackage.Flying);
const NormalTexture = Texture.from(Icon.CarePackage.Normal);

class CarePackage extends Component {
    constructor(minimap, data) {
        super(minimap);

        this._data = data;

        let carePackage = new Sprite(FlyingTexture);
        carePackage.anchor.x = 0.5;
        carePackage.anchor.y = 0.5;
        this._carePackage = carePackage;

        this.addChild(carePackage);

        carePackage.scale.x = .2;
        carePackage.scale.y = .2;

        this.spawnTime = data.spawnTime;
        this.landTime = data.landTime;

        this.interactive = true;
        this.buttonMode = true;

        let items = '';
        for (let numItem = 0; numItem < data.items.length; numItem++) {
            items += data.items[numItem].itemId;
            if (numItem !== data.items.length - 1) {
                items += '\n';
            }
        }

        let showName = false;

        let itemNameText = new Text(items, { fontSize: 16, fill: 'white', align: 'center' });
        itemNameText.anchor.set(0.5, 0.5);
        itemNameText.position.set(0, -(itemNameText.height / 2));

        let itemNameBox = new Graphics();
        itemNameBox.lineStyle(0.8, 0xffffff, 0.7);
        itemNameBox.beginFill(0x000000, 0.6);
        itemNameBox.drawRoundedRect(-(itemNameText.width / 2 + 2), -(itemNameText.height), itemNameText.width + 4, itemNameText.height + 4, 5);
        itemNameBox.endFill();

        itemNameText.visible = false;
        itemNameBox.visible = false;

        this.addChild(itemNameBox);
        this.addChild(itemNameText);

        this.on('click', () => {
            showName = !showName;
            itemNameText.visible = showName;
            itemNameBox.visible = showName;
        });


        this.on('click', () => {

        });
    }

    seek(time) {
        let { x, y } = this.toScaledPoint(this._data.spawnLocation);
        this.position.set(x, y);

        this.visible = this.spawnTime <= time;
        this._carePackage.texture = this.landTime <= time ? NormalTexture : FlyingTexture;
    }
}

export default CarePackage;

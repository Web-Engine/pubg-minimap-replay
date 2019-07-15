import * as PIXI from 'pixi.js';

class Minimap {
    constructor(data) {
        this.data = data;

        this.app = new PIXI.Application({
            width: 800,
            height: 800,
        });
    }
}

export { Minimap };
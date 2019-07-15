import { Application } from 'pixi.js';

class Minimap {
    constructor(data) {
        this.data = data;

        this.app = new Application({
            width: 800,
            height: 800,
        });
    }
}

export { Minimap };

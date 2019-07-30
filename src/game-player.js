import GameObject from './game-object';

class GamePlayer extends GameObject {
    constructor(minimap, data) {
        super(minimap, data.locations, data.shapes);

        this.interactive = true;
        this.buttonMode = true;
    }
}

export default GamePlayer;

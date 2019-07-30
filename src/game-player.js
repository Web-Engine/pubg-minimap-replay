import GameObject from './game-object'

class GamePlayer extends GameObject {
    constructor(minimap, data) {
        super(minimap, data.locations, data.shapes);
    }
}

export default GamePlayer;

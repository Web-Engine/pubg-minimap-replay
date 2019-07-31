import GameObject from './game-object';

class GameCharacter extends GameObject {
    constructor(minimap, data) {
        super(minimap, data.locations, data.shapes);

        this.interactive = true;
        this.buttonMode = true;
    }
}

export default GameCharacter;

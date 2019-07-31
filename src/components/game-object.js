import ShapeComponent from './shape-component';

class GameObject extends ShapeComponent {
    constructor(minimap, locations, shapes) {
        super(minimap, locations, shapes);
    }
}

export default GameObject;

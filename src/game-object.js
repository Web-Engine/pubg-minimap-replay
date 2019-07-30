import ShapeComponent from './shape-component';

class GameObject extends ShapeComponent {
    constructor(data) {
        super(data.locations, data.shapes);
    }
}

export default GameObject;

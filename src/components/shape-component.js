import Component from './component';
import TimeData from '../time-data';
import Shape from '../shape';

class ShapeComponent extends Component {
    constructor(minimap, locations, shapes) {
        super(minimap, locations);

        this._shapes = new TimeData(shapes);

        this._shape = new Shape();
        this.addChild(this._shape);
    }

    update(elapsedTime) {
        super.update(elapsedTime);

        this._shapes.seek(elapsedTime);
        this._draw();
    }

    _draw() {
        let { before, after, ratio } = this._shapes;

        let scaleX = this.scaleX;
        let scaleY = this.scaleY;

        if (before && before.fixSize) {
            scaleX = 1;
            scaleY = 1;
        }

        this._shape.draw(before, after, ratio, scaleX, scaleY);
        this._shape.position.set(-this._shape.width / 2, -this._shape.height / 2);
    }
}

export default ShapeComponent;

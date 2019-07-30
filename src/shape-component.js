import { Container, Sprite, Graphics } from 'pixi.js';
import { calcValueRatio } from './utils';
import Component from './component';
import TimeData from './time-data';

class ShapeComponent extends Component {
    constructor(locations, shapes) {
        super(locations);

        this._shapes = new TimeData(shapes);

        this._shapeContainer = new Container();

        this._shapeSprite = new Sprite();
        this._shapeContainer.addChild(this._shapeSprite);

        this._shapeRectangle = new Graphics();
        this._shapeContainer.addChild(this._shapeRectangle);

        this._shapeCircle = new Graphics();
        this._shapeContainer.addChild(this._shapeCircle);

        this.addChild(this._shapeContainer);
    }

    update(elapsedTime) {
        super.update(elapsedTime);

        this._shapes.seek(elapsedTime);
        this._draw();
    }

    _draw() {
        let { before, after, ratio } = this._shapes;

        if (!before) {
            this.visible = false;
            return;
        }

        this.visible = true;

        if (!after) {
            this._drawRatio(before, before, 1);
            return;
        }
        if (
            before.type !== after.type
        ) {
            this._drawRatio(before, before, 1);
            return;
        }

        if (!after.transition) {
            this._drawRatio(before, before, 1);
            return;
        }

        this._drawRatio(before, after, ratio);
    }

    _drawRatio(before, after, ratio) {
        this._shapeCircle.visible = false;
        this._shapeRectangle.visible = false;
        this._shapeSprite.visible = false;

        switch (before.type)
        {
            case 'circle':
                return this._drawCircle(before, after, ratio);

            case 'rectangle':
                return this._drawRectangle(before, after, ratio);

            case 'image':
                return this._drawImage(before, after, ratio);
        }
    }

    _drawCircle(before, after, ratio) {
        let radius = calcValueRatio(before.radius, after.radius, ratio);
        let lineWidth = calcValueRatio(before.lineWidth, after.lineWidth, ratio);
        let lineAlpha = calcValueRatio(before.lineAlpha, after.lineAlpha, ratio);
        let fillAlpha = calcValueRatio(before.fillAlpha, after.fillAlpha, ratio);
        let lineColor = before.lineColor;
        let fillColor = before.fillColor;

        this._shapeCircle.clear();

        this._shapeCircle.lineStyle(lineWidth, lineColor, lineAlpha);
        this._shapeCircle.beginFill(fillColor, fillAlpha);
        this._shapeCircle.drawCircle(0, 0, radius);
        this._shapeCircle.endFill();
        this._shapeCircle.visible = true;
    }

    _drawRectangle(before, after, ratio) {
        let width = calcValueRatio(before.width, after.width, ratio);
        let height = calcValueRatio(before.height, after.height, ratio);
        let lineWidth = calcValueRatio(before.lineWidth, after.lineWidth, ratio);
        let lineAlpha = calcValueRatio(before.lineAlpha, after.lineAlpha, ratio);
        let fillAlpha = calcValueRatio(before.fillAlpha, after.fillAlpha, ratio);
        let lineColor = before.lineColor;
        let fillColor = before.fillColor;

        this._shapeRectangle.clear();

        this._shapeRectangle.lineStyle(lineWidth, lineColor, lineAlpha);
        this._shapeRectangle.beginFill(fillColor, fillAlpha);
        this._shapeRectangle.drawRect(width / -2, height / -2, width, height);
        this._shapeRectangle.endFill();

        this._shapeRectangle.visible = true;
    }

    _drawImage(before, after, ratio) {
        let texture = before.texture;
        let width = calcValueRatio(before.width, after.width, ratio);
        let height = calcValueRatio(before.height, after.height, ratio);

        this._shapeSprite.texture = texture;
        this._shapeSprite.width = width;
        this._shapeSprite.height = height;
        this._shapeSprite.visible = true;
    }
}

export default ShapeComponent;

import { Container, Graphics, Sprite } from 'pixi.js';
import { calcValueRatio } from './utils'

class Shape extends Container {
    constructor() {
        super();

        this._sprite = new Sprite();
        this.addChild(this._sprite);

        this._rectangle = new Graphics();
        this.addChild(this._rectangle);

        this._circle = new Graphics();
        this.addChild(this._circle);
    }

    draw(before, after, ratio) {
        this._circle.visible = false;
        this._rectangle.visible = false;
        this._sprite.visible = false;

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

        this._circle.clear();

        this._circle.lineStyle(lineWidth, lineColor, lineAlpha);
        this._circle.beginFill(fillColor, fillAlpha);
        this._circle.drawCircle(0, 0, radius);
        this._circle.endFill();
        this._circle.visible = true;
    }

    _drawRectangle(before, after, ratio) {
        let width = calcValueRatio(before.width, after.width, ratio);
        let height = calcValueRatio(before.height, after.height, ratio);
        let lineWidth = calcValueRatio(before.lineWidth, after.lineWidth, ratio);
        let lineAlpha = calcValueRatio(before.lineAlpha, after.lineAlpha, ratio);
        let fillAlpha = calcValueRatio(before.fillAlpha, after.fillAlpha, ratio);
        let lineColor = before.lineColor;
        let fillColor = before.fillColor;

        this._rectangle.clear();

        this._rectangle.lineStyle(lineWidth, lineColor, lineAlpha);
        this._rectangle.beginFill(fillColor, fillAlpha);
        this._rectangle.drawRect(width / -2, height / -2, width, height);
        this._rectangle.endFill();

        this._rectangle.visible = true;
    }

    _drawImage(before, after, ratio) {
        let texture = before.texture;
        let width = calcValueRatio(before.width, after.width, ratio);
        let height = calcValueRatio(before.height, after.height, ratio);

        this._sprite.texture = texture;
        this._sprite.width = width;
        this._sprite.height = height;
        this._sprite.visible = true;
    }
}

export default Shape;

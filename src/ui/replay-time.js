import { Container, Text, Graphics } from 'pixi.js';

class ReplayTimeUI extends Container {
    constructor() {
        super();

        let timeDisplayBox = new Graphics();
        timeDisplayBox.lineStyle(1, 0xffffff);
        timeDisplayBox.beginFill(0x939393, 0.9);
        timeDisplayBox.drawRect(0, 0, 50, 30);
        timeDisplayBox.endFill();

        let currentReplayTimeText = new Text('0', { fontSize: 13, fill: 0xffffff });

        currentReplayTimeText.anchor.set(0.5, 0.5);
        currentReplayTimeText.position.set(25, 15);

        this.currentReplayTimeText = currentReplayTimeText;

        this.addChild(timeDisplayBox);
        this.addChild(currentReplayTimeText);
    }

    seek(time) {
        let currentTimeMin = Math.floor(time / 60000);
        let currentTimeSec = Math.floor((time % 60000) / 1000);

        this.currentReplayTimeText.text = currentTimeMin + ':' + currentTimeSec;
    }
}

export default ReplayTimeUI;

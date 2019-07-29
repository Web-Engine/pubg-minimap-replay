import { Container, Text, Graphics } from 'pixi.js';

class ReplayTimeUI extends Container {
    constructor() {
        super();

        let timeDisplayBox = new Graphics();
        timeDisplayBox.lineStyle(1, 0xffffff);
        timeDisplayBox.beginFill(0x939393, 0.9);
        timeDisplayBox.drawRect(0, 0, 50, 30);
        timeDisplayBox.endFill();

        let currentReplayTimeText = new Text('00:00', { fontSize: 13, fill: 0xffffff });

        currentReplayTimeText.anchor.set(0.5, 0.5);
        currentReplayTimeText.position.set(25, 15);

        this.currentReplayTimeText = currentReplayTimeText;

        this.addChild(timeDisplayBox);
        this.addChild(currentReplayTimeText);
    }

    seek(time) {
        let seconds = Math.floor(time / 1000);

        let minutes = Math.floor(seconds / 60);
        seconds %= 60;

        seconds = seconds.toString().padStart(2, '0');
        minutes = minutes.toString().padStart(2, '0');

        this.currentReplayTimeText.text = `${minutes}:${seconds}`;
    }
}

export default ReplayTimeUI;

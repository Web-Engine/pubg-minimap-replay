import { Application, Texture, Sprite } from 'pixi.js';
import Player from './components/player'

function binarySearch(array, value)
{
    let left = 0;
    let right = array.length;

    while (left <= right)
    {
        let mid = Math.floor((left + right) / 2);

        if (array[mid] === value) {
            return mid;
        }

        if (array[mid] <= value) {
            left = mid + 1;
        }
        else {
            right = mid - 1;
        }
    }

    return right;
}

class Minimap {
    constructor(data) {
        this.data = data;

        let meta = data.shift();
        let startTime = new Date(meta._D).getTime();

        for (let log of data) {
            log._elapsedTime = new Date(log._D).getTime() - startTime;
        }

        this.app = new Application({
            width: 819,
            height: 819,
            antialias: true
        });

        this.app.stage.transform.scale.set(0.1, 0.1);

        const backgroundTexture = Texture.from('./Sanhok_Main_High_Res.png');
        const background = new Sprite(backgroundTexture);
        this.app.stage.addChild(background);

        let positions = data.filter(log => log._T === 'LogPlayerPosition' && log.common.isGame !== 0);

        let characters = {};
        for (let position of positions) {
            if (!characters[position.character.accountId]) {
                characters[position.character.accountId] = [];
            }

            characters[position.character.accountId].push(position);
        }

        let players = {};
        for (let accountId in characters) {
            let character = characters[accountId][0].character;
            let player = new Player(character.playerName, character.teamId);

            players[character.accountId] = player;
            this.app.stage.addChild(player);
        }

        this.currentTime = 0;

        this.app.ticker.add(delta => {
            for (let accountId in players) {
                let positions = characters[accountId].map(log => log.character.location);
                let times = characters[accountId].map(log => log._elapsedTime);
                let index = binarySearch(times, this.currentTime);

                if (index === -1) {
                    players[accountId].x = -1000;
                    players[accountId].y = -1000;
                }
                else if (index + 1 === times.length) {
                    players[accountId].x = positions[index].x;
                    players[accountId].y = positions[index].y;
                }
                else {
                    let diff = times[index + 1] - times[index];
                    let ratio = (this.currentTime - times[index]) / diff;

                    players[accountId].x = positions[index].x * (1 - ratio) + positions[index + 1].x * ratio;
                    players[accountId].y = positions[index].y * (1 - ratio) + positions[index + 1].y * ratio;
                }

                players[accountId].x *=  8192 / 400000;
                players[accountId].y *=  8192 / 400000;
                // console.log('Hello');
            }

            this.currentTime += delta * window.speed;
        });
    }
}

window.speed = 100;

export { Minimap };

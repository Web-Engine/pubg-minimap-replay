import { Application, Texture, Sprite } from 'pixi.js';
import Player from './components/player'
import WhiteCircle from './components/whiteCircle';
import RedZone from './components/redZone';
import SafetyZone from './components/safetyZone';

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

        this.app.stage.transform.scale.set(819/1000, 819/1000);

        const backgroundTexture = Texture.from('./Sanhok_Main_Low_Res.png');
        const background = new Sprite(backgroundTexture);
        this.app.stage.addChild(background);

        let positions = data.filter(log => log._T === 'LogPlayerPosition' && log.common.isGame !== 0);

        let characters = {};
        for (let position of positions) {
            let accountId = position.character.accountId;

            if (!characters[accountId]) {
                characters[accountId] = [];
            }

            characters[accountId].push(position);
        }

        let players = {};
        for (let accountId in characters) {
            let character = characters[accountId][0].character;
            let player = new Player(character.name, character.teamId);

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

                players[accountId].x *=  1000 / 400000;
                players[accountId].y *=  1000 / 400000;
                // console.log('Hello');
            }
        });

        let gameStates = data.filter(log => log._T === 'LogGameStatePeriodic');
        let position = { x: 0, y: 0 };
        let radius = 0;

        let whiteCircle = new WhiteCircle(position.x, position.y, radius);
        this.app.stage.addChild(whiteCircle);

        this.app.ticker.add(delta => {
            let index = gameStates.findIndex(log => log._elapsedTime > this.currentTime);

            if (index === -1) return;
            if (index === 0) return;

            whiteCircle.position.x = gameStates[index - 1].gameState.poisonGasWarningPosition.x * 1000 / 400000;
            whiteCircle.position.y = gameStates[index - 1].gameState.poisonGasWarningPosition.y * 1000 / 400000;
            whiteCircle.resizeCircle(gameStates[index - 1].gameState.poisonGasWarningRadius * 1000 / 400000);
        });

        let redZone = new RedZone(position.x, position.y, radius);
        this.app.stage.addChild(redZone);

        this.app.ticker.add(delta => {
            let index = gameStates.findIndex(log => log._elapsedTime > this.currentTime);

            if (index === -1) return;
            if (index === 0) return;

            redZone.position.x = gameStates[index - 1].gameState.redZonePosition.x * 1000 / 400000;
            redZone.position.y = gameStates[index - 1].gameState.redZonePosition.y * 1000 / 400000;
            redZone.resizeCircle(gameStates[index - 1].gameState.redZoneRadius * 1000 / 400000);
        });

        let safetyZone = new SafetyZone(gameStates[0].gameState.safetyZonePosition.x, gameStates[0].gameState.safetyZonePosition.y,gameStates[0].gameState.safetyZoneRadius);
        this.app.stage.addChild(safetyZone);
        console.log(gameStates);

        this.app.ticker.add(delta => {
            let i;
            for (i = 0; i < gameStates.length; i++)
            {
                let log = gameStates[i];
                if (log._elapsedTime > this.currentTime) break;
            }

            if (i === gameStates.length)
            {
                position = gameStates[gameStates.length - 1].gameState.safetyZonePosition;
                radius = gameStates[gameStates.length - 1].gameState.safetyZoneRadius;
            }

            else if (i !== 0)
            {
                let before = gameStates[i - 1];
                let after = gameStates[i];

                let diffTime = after._elapsedTime - before._elapsedTime;
                let ratio = (this.currentTime - before._elapsedTime) / diffTime;

                let beforeState = before.gameState;
                let afterState = after.gameState;

                let beforePosition = beforeState.safetyZonePosition;
                let afterPosition = afterState.safetyZonePosition;

                let beforeRadius = beforeState.safetyZoneRadius;
                let afterRadius = afterState.safetyZoneRadius;

                position = {
                    x: beforePosition.x * (1 - ratio) + afterPosition.x * ratio,
                    y: beforePosition.y * (1 - ratio) + afterPosition.y * ratio,
                };

                radius = beforeRadius * (1 - ratio) + afterRadius * ratio;
            }

            safetyZone.position.x = position.x * 1000 / 400000;
            safetyZone.position.y = position.y * 1000 / 400000;
            safetyZone.resizeCircle(radius * 1000 / 400000);
        });

        this.app.ticker.add(delta => {
            this.currentTime += delta * window.speed;
        });
    }
}

window.speed = 100;

export { Minimap };

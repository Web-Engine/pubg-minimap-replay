import { Application, Texture, Sprite } from 'pixi.js';
import Player from './components/player'
import WhiteCircle from './components/whiteCircle';
import RedZone from './components/redZone';
import SafetyZone from './components/safetyZone';
import { findCurrentState, getTime } from './utils';

import { Background } from './assets';

function normalizeData(data, ratio) {
    let meta = data.shift();
    let logs = {};

    for (let log of data) {
        if (!(log._T in logs)) {
            logs[log._T] = [];
        }

        logs[log._T].push(log);
    }

    if (!('LogMatchStart' in logs)) {
        throw "Doesn't have match start data";
    }

    if (!('LogMatchEnd' in logs)) {
        throw "Doesn't have match end data";
    }

    let matchStart = logs.LogMatchStart[0];
    let matchEnd = logs.LogMatchEnd[0];

    let startTime = getTime(matchStart._D);
    for (let log of data) {
        log._elapsedTime = getTime(log._D) - startTime;
    }

    // Load map data
    let mapName = matchStart.mapName;

    // Load player data
    let players = matchStart.characters;

    let positions = {};
    for (let positionLog of logs.LogPlayerPosition) {
        let accountId = positionLog.character.accountId;

        if (!(accountId in positions)) {
            positions[accountId] = [];
        }

        if (positionLog._elapsedTime < 0) continue;

        positions[accountId].push({
            elapsedTime: positionLog._elapsedTime,
            location: {
                x: positionLog.character.location.x * ratio,
                y: positionLog.character.location.y * ratio,
            },
        });
    }

    for (let player of players) {
        player.positions = positions[player.accountId];
        player.positions.unshift({
            elapsedTime: 0,
            location: {
                x: player.location.x * ratio,
                y: player.location.y * ratio,
            },
        });
    }

    // Load game states
    let whiteCircle = [];
    let safetyZone = [];
    let redZone = [];

    for (let log of logs.LogGameStatePeriodic) {
        let gameState = log.gameState;

        whiteCircle.push({
            elapsedTime: log._elapsedTime,
            position: {
                x: gameState.poisonGasWarningPosition.x * ratio,
                y: gameState.poisonGasWarningPosition.y * ratio,
            },
            radius: gameState.poisonGasWarningRadius * ratio,
        });

        safetyZone.push({
            elapsedTime: log._elapsedTime,
            position: {
                x: gameState.safetyZonePosition.x * ratio,
                y: gameState.safetyZonePosition.y * ratio,
            },
            radius: gameState.safetyZoneRadius * ratio,
        });

        redZone.push({
            elapsedTime: log._elapsedTime,
            position: {
                x: gameState.redZonePosition.x * ratio,
                y: gameState.redZonePosition.y * ratio,
            },
            radius: gameState.redZoneRadius * ratio,
        });
    }

    return {
        players,
        whiteCircle,
        safetyZone,
        redZone
    };
    // return data;
}

class Minimap {
    constructor(data) {
        const canvasSize = 819;
        const mapSize = 400000;
        const size = 10000;
        const sizeRatio = size / mapSize;

        data = normalizeData(data, sizeRatio);

        this.data = data;

        // Create pixi application
        this.app = new Application({
            width: canvasSize,
            height: canvasSize,
            antialias: true
        });

        this.app.stage.transform.scale.set(canvasSize / size, canvasSize / size);

        this.currentTime = 0;

        // Increase time
        this.app.ticker.add(delta => {
            this.currentTime += delta * window.speed;
        });

        // Load background sprite
        const backgroundTexture = Texture.from(Background.Sanhok.low);
        const background = new Sprite(backgroundTexture);
        background.width = size;
        background.height = size;
        this.app.stage.addChild(background);

        // Create players
        let playerSprites = [];

        for (let player of data.players) {
            let playerSprite = new Player(player);
            this.app.stage.addChild(playerSprite);

            playerSprites.push(playerSprite);
        }

        this.app.ticker.add(() => {
            for (let player of playerSprites) {
                player.seek(this.currentTime);
            }
        });

        // Create circles
        let whiteCircle = new WhiteCircle(data.whiteCircle);
        let redZone = new RedZone(data.redZone);
        let safetyZone = new SafetyZone(data.safetyZone);

        this.app.stage.addChild(whiteCircle);
        this.app.stage.addChild(safetyZone);
        this.app.stage.addChild(redZone);

        this.app.ticker.add(() => {
            whiteCircle.seek(this.currentTime);
            redZone.seek(this.currentTime);
            safetyZone.seek(this.currentTime);
        });
    }
}

window.speed = 100;

export { Minimap };

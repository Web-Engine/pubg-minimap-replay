import { Application, Texture, Sprite } from 'pixi.js';
import Player from './components/player'
import WhiteCircle from './components/whiteCircle';
import RedZone from './components/redZone';
import SafetyZone from './components/safetyZone';
import { findCurrentState, getTime } from './utils';

import { Background } from './assets';

function normalizeData(data) {
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
            location: positionLog.character.location,
        });
    }

    for (let player of players) {
        player.positions = positions[player.accountId];
        player.positions.unshift({
            elapsedTime: 0,
            location: player.location,
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
            position: gameState.poisonGasWarningPosition,
            radius: gameState.poisonGasWarningRadius,
        });

        safetyZone.push({
            elapsedTime: log._elapsedTime,
            position: gameState.safetyZonePosition,
            radius: gameState.safetyZoneRadius,
        });

        redZone.push({
            elapsedTime: log._elapsedTime,
            position: gameState.redZonePosition,
            radius: gameState.redZoneRadius,
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

        data = normalizeData(data);

        this.data = data;

        // Create pixi application
        this.app = new Application({
            width: canvasSize,
            height: canvasSize,
            antialias: true
        });

        this.app.stage.transform.scale.set(canvasSize / size, canvasSize / size);

        this.currentTime = 0;

        // time increase
        this.app.ticker.add(delta => {
            this.currentTime += delta * window.speed;
        });

        // Load background sprite
        const backgroundTexture = Texture.from(Background.Sanhok.low);
        const background = new Sprite(backgroundTexture);
        background.width = size;
        background.height = size;
        this.app.stage.addChild(background);

        // Load player objects
        let playerSprites = [];

        for (let player of data.players) {
            let playerSprite = new Player(player);
            this.app.stage.addChild(playerSprite);

            playerSprites.push(playerSprite);
        }

        this.app.ticker.add(() => {
            for (let player of playerSprites) {
                let positions = player.positions;
                let { before, after, ratio } = findCurrentState(positions, this.currentTime);

                if (!before) {
                    player.x = -1000;
                    player.y = -1000;
                    continue;
                }

                if (!after) {
                    player.x = before.location.x * sizeRatio;
                    player.y = before.location.y * sizeRatio;
                    continue;
                }

                let x = before.location.x * ratio + after.location.x * (1 - ratio);
                let y = before.location.y * ratio + after.location.y * (1 - ratio);

                player.position.set(x * sizeRatio, y * sizeRatio);
            }
        });

        // white circle
        let whiteCircle = new WhiteCircle();
        this.app.stage.addChild(whiteCircle);

        this.app.ticker.add(() => {
            let { before } = findCurrentState(data.whiteCircle, this.currentTime);
            if (!before) return;

            whiteCircle.position.set(before.position.x * sizeRatio, before.position.y * sizeRatio);
            whiteCircle.radius = before.radius * sizeRatio;
        });

        // red zone
        let redZone = new RedZone();
        this.app.stage.addChild(redZone);

        this.app.ticker.add(() => {
            let { before } = findCurrentState(data.redZone, this.currentTime);
            if (!before) return;

            redZone.position.set(before.position.x * sizeRatio, before.position.y * sizeRatio);
            redZone.radius = before.radius * sizeRatio;
        });

        // safety zone
        let safetyZone = new SafetyZone();
        this.app.stage.addChild(safetyZone);

        this.app.ticker.add(() => {
            let { before, after, ratio } = findCurrentState(data.safetyZone, this.currentTime);
            if (!before) return;
            if (!after) {
                safetyZone.position.set(before.position.x * sizeRatio, before.position.y * sizeRatio);
                safetyZone.radius = before.radius * sizeRatio;
                return;
            }

            let x = before.position.x * ratio + after.position.x * (1 - ratio);
            let y = before.position.y * ratio + after.position.y * (1 - ratio);
            let radius = before.radius * ratio + after.radius * (1 - ratio);

            safetyZone.position.set(x * sizeRatio, y * sizeRatio);
            safetyZone.radius = radius * sizeRatio;
            // safetyZone.resizeCircle(radius * sizeRatio);
        });
    }
}

window.speed = 100;

export { Minimap };

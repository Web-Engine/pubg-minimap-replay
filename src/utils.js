function binarySearch(array, value) {
    let left = 0;
    let right = array.length;

    while (left <= right) {
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

function findCurrentState(array, time) {
    let left = 0;
    let right = array.length - 1;

    while (left <= right)
    {
        let mid = Math.floor((left + right) / 2);

        if (array[mid].elapsedTime === time) {
            return {
                before: array[mid],
                after: array[mid + 1],
                ratio: 1,
            };
        }

        if (array[mid].elapsedTime < time) {
            left = mid + 1;
        }
        else {
            right = mid - 1;
        }
    }

    let before = array[right];
    let after = array[left];

    if (!before || !after) {
        return { before, after, ratio: NaN };
    }

    let difftime = after.elapsedTime - before.elapsedTime;
    let ratio = (after.elapsedTime - time) / difftime;

    return { before, after, ratio };
}

const mapNames = {
    Desert_Main: "Miramar",
    DihorOtok_Main: "Vikendi",
    Erangel_Main: "Erangel",
    Range_Main: "Camp_Jackal",
    Savage_Main: "Sanhok"
};

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
    let terrain = matchStart.mapName;
    let mapName = mapNames[terrain];

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

    let carePackages = logs.LogCarePackageSpawn.map(spawn => ({
        spawnTime: spawn._elapsedTime,
        location: {
            x: spawn.itemPackage.location.x * ratio,
            y: spawn.itemPackage.location.y * ratio,
        },
    }));

    for (let i = 0; i < carePackages.length; i++)
    {
        let log = logs.LogCarePackageLand[i];

        carePackages[i].landTime = log._elapsedTime;
    }

    return {
        meta: {
            terrain,
            mapName,
        },
        players,
        whiteCircle,
        safetyZone,
        redZone,
        carePackages,
    };
}

function getTime(str) {
    return new Date(str).getTime();
}

export { binarySearch, getTime, findCurrentState, normalizeData };

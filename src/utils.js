function findCurrentState(array, time) {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
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


// Normalized data should be formatted like:
// {
//     let string = '';
//     let number = 1.234;
//     let int = 1;
//
//     let accountId = string;
//
//     let data = {
//         meta: {
//             mapName: string, // Erangel, Miramar, Vikendi, Sanhok, Camp_Jackal
//             terrain: string, // Erangel_Main, Desert_Main, DihorOtok_Main, Savage_Main, Range_Main
//         },
//
//         players: {
//             [accountId]: {
//                 name: string,
//                 teamId: int,
//                 ranking: int,
//                 locations: [
//                     {
//                         location: {
//                             x: number,
//                             y: number,
//                         },
//                         elapsedTime: number,
//                     },
//                     // ...
//                 ],
//                 healths: [
//                     {
//                         health: number,
//                         elapsedTime: number,
//                     },
//                     // ...
//                 ],
//             },
//             ...
//         },
//
//         redZone: [
//             {
//                 location: {
//                     x: number,
//                     y: number,
//                 },
//                 radius: number,
//             },
//         ],
//
//         safetyArea: [
//             {
//                 location: {
//                     x: number,
//                     y: number,
//                 },
//                 radius: number,
//             },
//         ],
//
//         whiteCircle: [
//             {
//                 location: {
//                     x: number,
//                     y: number,
//                     z: number,
//                 },
//                 radius: number,
//             },
//             // ...
//         ],
//
//         alivePlayers: [
//             {
//                 numAlivePlayers: int,
//                 elapsedTime: number,
//             }
//         ],
//
//         carePackages: [
//             {
//                 spawnTime: number,
//                 spawnLocation: {
//                     x: number,
//                     y: number,
//                 },
//                 landTime: number,
//                 landLocation: {
//                     x: number,
//                     y: number,
//                 },
//             },
//             // ...
//         ],
//     }
// }

const mapNames = {
    Desert_Main: 'Miramar',
    DihorOtok_Main: 'Vikendi',
    Erangel_Main: 'Erangel',
    Range_Main: 'Camp_Jackal',
    Savage_Main: 'Sanhok',
};

function back(array, index) {
    if (array.length <= index) return null;

    return array[array.length - index - 1];
}

function last(array) {
    return back(array, 0);
}

function isLocationEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;

    return a.x === b.x && a.y === b.y;
}

function isCircleEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;

    return isLocationEqual(a.location, b.location) && a.radius === b.radius;
}

function normalizeData(logs, ratio) {
    function normalizeNumber(number) {
        return number * ratio;
    }

    function normalizeLocation(location) {
        return {
            x: location.x * ratio,
            y: location.y * ratio,
        };
    }

    function isPlayer(character) {
        return character && character.accountId;
    }

    function getPlayer(accountId) {
        if (accountId in data.players) {
            return data.players[accountId];
        }

        data.players[accountId] = {
            accountId,
            name: null,
            teamId: 0,
            ranking: 0,
            locations: [],
            healths: [],
        };

        return data.players[accountId];
    }

    function addPlayerInformation(character, elapsedTime) {
        addPlayerLocation(character, elapsedTime);
        addPlayerHealth(character, elapsedTime);
    }

    function addPlayerLocation(character, elapsedTime) {
        let player = getPlayer(character.accountId);
        let lastLocation = last(player.locations);

        if (isLocationEqual(lastLocation, character.location)) return;

        let { x, y } = character.location;

        player.locations.push({
            location: normalizeLocation({ x, y }),
            elapsedTime,
        });
    }

    function addPlayerHealth(character, elapsedTime) {
        let player = getPlayer(character.accountId);

        let lastHealth = last(player.healths);
        if (lastHealth && character.health === lastHealth.health) return;

        player.healths.push({
            health: character.health,
            elapsedTime,
        });
    }

    function addWhiteCircle({ x, y }, radius, elapsedTime) {
        let lastWhiteCircle = last(data.whiteCircle);

        let circle = {
            location: normalizeLocation({ x, y }),
            radius: normalizeNumber(radius),
        };

        if (isCircleEqual(lastWhiteCircle, circle)) {
            return;
        }

        data.whiteCircle.push({
            ...circle,
            elapsedTime,
        });
    }

    function addSafetyZone({ x, y }, radius, elapsedTime) {
        let beforeLast = back(data.safetyZone, 1);

        if (beforeLast && beforeLast.radius === radius) {
            return;
        }

        data.safetyZone.push({
            location: normalizeLocation({ x, y }),
            radius: normalizeNumber(radius),
            elapsedTime,
        });
    }

    function addRedZone({ x, y }, radius, elapsedTime) {
        let lastRedZone = last(data.redZone);

        let circle = {
            location: normalizeLocation({ x, y }),
            radius: normalizeNumber(radius),
        };

        if (isCircleEqual(lastRedZone, circle)) {
            return;
        }

        data.redZone.push({
            ...circle,
            elapsedTime,
        });
    }

    function addAlivePlayers(numAlivePlayers, elapsedTime) {
        data.alivePlayers.push({
            numAlivePlayers,
            elapsedTime,
        });
    }

    {
        let i;
        for (i = 0; i < logs.length; i++) {
            if (logs[i]._T === 'LogMatchStart') break;
        }

        logs.splice(0, i);
    }

    if (logs.length === 0) {
        throw 'Cannot found match start data';
    }

    let matchStart = logs.shift();

    let data = {
        meta: {
            mapName: mapNames[matchStart.mapName],
            terrain: matchStart.mapName,
        },
        players: {},
        redZone: [],
        whiteCircle: [],
        safetyZone: [],
        carePackages: [],
        alivePlayers: [],
    };

    for (let character of matchStart.characters) {
        addPlayerInformation(character, 0);
    }

    let startTime = getTime(matchStart._D);

    let carePackageLandIndex = 0;

    for (let log of logs) {
        let type = log._T;
        let logTime = getTime(log._D);
        let elapsedTime = logTime - startTime;

        switch (type) {
        case 'LogArmorDestroy': {
            if (isPlayer(log.attacker)) {
                addPlayerInformation(log.attacker, elapsedTime);
            }

            addPlayerInformation(log.victim, elapsedTime);
            break;
        }

        case 'LogCarePackageLand': {
            let itemPackage = log.itemPackage;

            let landLocation = {
                x: itemPackage.location.x,
                y: itemPackage.location.y,
            };

            data.carePackages[carePackageLandIndex].landLocation = normalizeLocation(landLocation);
            data.carePackages[carePackageLandIndex].landTime = elapsedTime;
            carePackageLandIndex++;
            break;
        }

        case 'LogCarePackageSpawn': {
            let itemPackage = log.itemPackage;

            let spawnLocation = {
                x: itemPackage.location.x,
                y: itemPackage.location.y,
            };

            data.carePackages.push({
                spawnTime: elapsedTime,
                spawnLocation: normalizeLocation(spawnLocation),

                landTime: null,
                landLocation: null,
            });

            break;
        }

        case 'LogGameStatePeriodic': {
            let gameState = log.gameState;

            addWhiteCircle(gameState.poisonGasWarningPosition, gameState.poisonGasWarningRadius, elapsedTime);
            addSafetyZone(gameState.safetyZonePosition, gameState.safetyZoneRadius, elapsedTime);
            addRedZone(gameState.redZonePosition, gameState.redZoneRadius, elapsedTime);
            addAlivePlayers(gameState.numAlivePlayers, elapsedTime);

            break;
        }

        case 'LogHeal': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemAttach': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemDetach': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemDrop': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemEquip': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemPickup': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemPickupFromCarepackage': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemPickupFromLootbox': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemUnequip': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogItemUse': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogMatchDefinition': {
            break;
        }

        case 'LogMatchEnd': {
            // TODO: update rank
            for (let character of log.characters) {
                let player = getPlayer(character.accountId);

                player.name = character.name;
                player.teamId = character.teamId;
                player.ranking = character.ranking;
            }

            break;
        }

        // Already handle LogMatchStart
        // case 'LogMatchStart': {
        //     break;
        // }

        case 'LogObjectDestroy': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogParachuteLanding': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogPlayerAttack': {
            if (isPlayer(log.attacker)) {
                addPlayerInformation(log.attacker, elapsedTime);
            }

            break;
        }

        case 'LogPlayerCreate': {
            break;
        }

        case 'LogPlayerKill': {
            if (isPlayer(log.killer)) {
                addPlayerInformation(log.killer, elapsedTime);
            }

            addPlayerInformation(log.victim, elapsedTime);

            if (isPlayer(log.assistant)) {
                addPlayerInformation(log.assistant, elapsedTime);
            }

            break;
        }

        case 'LogPlayerLogin': {
            break;
        }

        case 'LogPlayerLogout': {
            break;
        }

        case 'LogPlayerMakeGroggy': {
            if (isPlayer(log.attacker)) {
                addPlayerInformation(log.attacker, elapsedTime);
            }

            addPlayerInformation(log.victim, elapsedTime);
            break;
        }

        case 'LogPlayerPosition': {
            addPlayerInformation(log.character, elapsedTime);
            addAlivePlayers(log.numAlivePlayers, elapsedTime);
            break;
        }

        case 'LogPlayerRevive': {
            addPlayerInformation(log.reviver, elapsedTime);

            addPlayerInformation(log.victim, elapsedTime);
            break;
        }

        case 'LogPlayerTakeDamage': {
            if (isPlayer(log.attacker)) {
                addPlayerInformation(log.attacker, elapsedTime);
            }

            addPlayerInformation(log.victim, elapsedTime);
            break;
        }

        case 'LogRedZoneEnded': {
            for (let driver of log.drivers) {
                addPlayerInformation(driver, elapsedTime);
            }
            break;
        }

        case 'LogSwimEnd': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogSwimStart': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogVaultStart': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogVehicleDestroy': {
            if (isPlayer(log.attacker)) {
                addPlayerInformation(log.attacker, elapsedTime);
            }

            break;
        }

        case 'LogVehicleLeave': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogVehicleRide': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogWeaponFireCount': {
            addPlayerInformation(log.character, elapsedTime);
            break;
        }

        case 'LogWheelDestroy': {
            if (isPlayer(log.attacker)) {
                addPlayerInformation(log.attacker, elapsedTime);
            }

            break;
        }
        }
    }

    return data;
}

function getTime(str) {
    return new Date(str).getTime();
}

export { findCurrentState, normalizeData };

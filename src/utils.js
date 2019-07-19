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



// normalized data should be formatted like:
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
    Desert_Main: "Miramar",
    DihorOtok_Main: "Vikendi",
    Erangel_Main: "Erangel",
    Range_Main: "Camp_Jackal",
    Savage_Main: "Sanhok"
};

function last(array) {
    return array[array.length - 1];
}

function isLocationEqual(a, b) {
    return a.x === b.x && a.y === b.y;
}

function normalizeData(logs, ratio) {
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
            healths: [
                {
                    health: 100,
                    elapsedTime: 0,
                }
            ],
        };

        return data.players[accountId];
    }

    function addPlayerInformation(character, elapsedTime) {
        addPlayerLocation(character, elapsedTime);
        addPlayerHealth(character, elapsedTime);
    }

    function addPlayerLocation(character, elapsedTime) {
        let player = getPlayer(character.accountId);

        if (player.locations.length) {
            let lastLocation = last(player.locations);

            if (isLocationEqual(lastLocation, character.location)) {
                return;
            }
        }

        let { x, y } = character.location;
        player.locations.push({
            location: { x, y },
            elapsedTime,
        });
    }

    function addPlayerHealth(character, elapsedTime) {
        let player = getPlayer(character.accountId);

        let lastHealth = last(player.healths).health;
        if (character.health === lastHealth) return;

        player.healths.push({
            health: character.health,
            elapsedTime,
        });
    }

    {
        let i;
        for (i = 0; i < logs.length; i++)
        {
            if (logs[i]._T === 'LogMatchStart') break;
        }

        logs.splice(0, i);
    }

    if (logs.length === 0) {
        throw 'Cannot found match start data';
    }

    let matchStart = logs.shift();

    let startTime = getTime(matchStart._D);

    let data = {
        meta: {
            mapName: null,
            terrain: null,
        },
        players: {},
        redZone: [],
        whiteCircle: [],
        safetyZone: [],
        carePackages: [],
        alivePlayers: [],
    };

    for (let log of logs)
    {
        let type = log._T;
        let logTime = getTime(log._D);
        let elapsedTime = logTime - startTime;

        // console.log(type, log);
        switch (type)
        {
            case 'LogArmorDestroy': {
                if (isPlayer(log.attacker)) {
                    addPlayerInformation(log.attacker, elapsedTime);
                }

                addPlayerInformation(log.victim, elapsedTime);
                break;
            }

            case 'LogCarePackageLand': {
                break;
            }

            case 'LogCarePackageSpawn': {
                break;
            }

            case 'LogGameStatePeriodic': {
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
                    addPlayerInformation(character, elapsedTime);

                    let player = getPlayer(character.accountId);

                    player.name = character.name;
                    player.teamId = character.teamId;
                    player.ranking = character.ranking;
                }

                break;
            }

            case 'LogMatchStart': {
                for (let character of log.characters) {
                    addPlayerInformation(character, elapsedTime);
                }

                data.meta.terrain = log.mapName;
                data.meta.mapName = mapNames[data.meta.terrain];
                break;
            }

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

    console.log(data);
    return data;
}

function getTime(str) {
    return new Date(str).getTime();
}

export { binarySearch, getTime, findCurrentState, normalizeData };

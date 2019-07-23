

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
//                         state: enum { ALIVE, GROGGY, DEAD },
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

const enums = {
    PlayerState: {
        ALIVE: 'ALIVE',
        GROGGY: 'GROGGY',
        DEAD: 'DEAD',
    },
};

function normalizeData(logs, ratio) {
    window.logs = logs;

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
            healths: [
                {
                    state: enums.PlayerState.ALIVE,
                    health: 100,
                    elapsedTime: 0,
                },
            ],
        };

        return data.players[accountId];
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

    function addPlayerHealth(character, health, state, elapsedTime) {
        let player = getPlayer(character.accountId);
        let lastHealth = last(player.healths);

        if (!state) {
            state = lastHealth.state;
        }

        if (lastHealth.state === state && lastHealth.health === health) return;

        if (state !== enums.PlayerState.ALIVE && lastHealth.state === enums.PlayerState.ALIVE && lastHealth.health === 0) {
            lastHealth.state = state;
            return;
        }

        player.healths.push({
            state,
            health,
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
            duration: 0,
        },
        players: {},
        redZone: [],
        whiteCircle: [],
        safetyZone: [],
        carePackages: [],
        alivePlayers: [],
    };

    for (let character of matchStart.characters) {
        addPlayerLocation(character, 0);
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
                    addPlayerLocation(log.attacker, elapsedTime);
                }

                addPlayerLocation(log.victim, elapsedTime);
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

                    items: itemPackage.items,
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
                addPlayerLocation(log.character, elapsedTime);
                addPlayerHealth(log.character, log.character.health, enums.PlayerState.ALIVE, elapsedTime);
                break;
            }

            case 'LogItemAttach': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogItemDetach': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogItemDrop': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogItemEquip': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogItemPickup': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogItemPickupFromCarepackage': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogItemPickupFromLootbox': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogItemUnequip': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogItemUse': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogMatchDefinition': {
                break;
            }

            case 'LogMatchEnd': {
                for (let character of log.characters) {
                    let player = getPlayer(character.accountId);

                    player.name = character.name;
                    player.teamId = character.teamId;
                    player.ranking = character.ranking;
                }

                data.meta.duration = elapsedTime;
                break;
            }

            // Already handle LogMatchStart
            // case 'LogMatchStart': {
            //     break;
            // }

            case 'LogObjectDestroy': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogParachuteLanding': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogPlayerAttack': {
                if (isPlayer(log.attacker)) {
                    addPlayerLocation(log.attacker, elapsedTime);
                }

                break;
            }

            case 'LogPlayerCreate': {
                break;
            }

            case 'LogPlayerKill': {
                if (isPlayer(log.killer)) {
                    addPlayerLocation(log.killer, elapsedTime);
                }

                addPlayerLocation(log.victim, elapsedTime);
                addPlayerHealth(log.victim, 0, enums.PlayerState.DEAD, elapsedTime);

                if (isPlayer(log.assistant)) {
                    addPlayerLocation(log.assistant, elapsedTime);
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
                    addPlayerLocation(log.attacker, elapsedTime);
                }

                addPlayerLocation(log.victim, elapsedTime);
                addPlayerHealth(log.victim, 0, enums.PlayerState.GROGGY, elapsedTime);
                break;
            }

            case 'LogPlayerPosition': {
                addPlayerLocation(log.character, elapsedTime);
                addAlivePlayers(log.numAlivePlayers, elapsedTime);
                break;
            }

            case 'LogPlayerRevive': {
                addPlayerLocation(log.reviver, elapsedTime);
                addPlayerLocation(log.victim, elapsedTime);

                addPlayerHealth(log.victim, log.victim.health, enums.PlayerState.ALIVE, elapsedTime);
                break;
            }

            case 'LogPlayerTakeDamage': {
                if (isPlayer(log.attacker)) {
                    addPlayerLocation(log.attacker, elapsedTime);
                }

                addPlayerLocation(log.victim, elapsedTime);
                addPlayerHealth(log.victim, log.victim.health - log.damage, null, elapsedTime);
                break;
            }

            case 'LogRedZoneEnded': {
                for (let driver of log.drivers) {
                    addPlayerLocation(driver, elapsedTime);
                }
                break;
            }

            case 'LogSwimEnd': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogSwimStart': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogVaultStart': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogVehicleDestroy': {
                if (isPlayer(log.attacker)) {
                    addPlayerLocation(log.attacker, elapsedTime);
                }

                break;
            }

            case 'LogVehicleLeave': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogVehicleRide': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogWeaponFireCount': {
                addPlayerLocation(log.character, elapsedTime);
                break;
            }

            case 'LogWheelDestroy': {
                if (isPlayer(log.attacker)) {
                    addPlayerLocation(log.attacker, elapsedTime);
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

export { normalizeData, enums };
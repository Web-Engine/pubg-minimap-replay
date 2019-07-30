

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

const mapSizes = {
    Desert_Main: 8000,
    DihorOtok_Main: 6000,
    Erangel_Main: 8000,
    Range_Main: 2000,
    Savage_Main: 4000,
};

const itemNames = {
    'Item_Ammo_12Guage_C': '12 Gauge Ammo',
    'Item_Ammo_300Magnum_C': '300 Magnum Ammo',
    'Item_Ammo_45ACP_C': '.45 ACP Ammo',
    'Item_Ammo_556mm_C': '5.56mm Ammo',
    'Item_Ammo_762mm_C': '7.62mm Ammo',
    'Item_Ammo_9mm_C': '9mm Ammo',
    'Item_Ammo_Bolt_C': 'Crossbow Bolt',
    'Item_Ammo_Flare_C': 'Flare Gun Ammo',
    'Item_Armor_C_01_Lv3_C': 'Military Vest (Level 3)',
    'Item_Armor_D_01_Lv2_C': 'Police Vest (Level 2)',
    'Item_Armor_E_01_Lv1_C': 'Police Vest (Level 1)',
    'Item_Attach_Weapon_Lower_AngledForeGrip_C': 'Angled Foregrip',
    'Item_Attach_Weapon_Lower_Foregrip_C': 'Vertical Foregrip',
    'Item_Attach_Weapon_Lower_HalfGrip_C': 'Half Grip',
    'Item_Attach_Weapon_Lower_LaserPointer_C': 'Laser Sight',
    'Item_Attach_Weapon_Lower_LightweightForeGrip_C': 'Light Grip',
    'Item_Attach_Weapon_Lower_QuickDraw_Large_Crossbow_C': 'QuickDraw Crossbow Quiver',
    'Item_Attach_Weapon_Lower_ThumbGrip_C': 'Thumb Grip',
    'Item_Attach_Weapon_Magazine_Extended_Large_C': 'Large Extended Mag',
    'Item_Attach_Weapon_Magazine_Extended_Medium_C': 'Medium Extended Mag',
    'Item_Attach_Weapon_Magazine_Extended_Small_C': 'Small Extended Mag',
    'Item_Attach_Weapon_Magazine_Extended_SniperRifle_C': 'Sniper Rifle Extended Mag',
    'Item_Attach_Weapon_Magazine_ExtendedQuickDraw_Large_C': 'Large Extended QuickDraw Mag',
    'Item_Attach_Weapon_Magazine_ExtendedQuickDraw_Medium_C': 'Medium Extended QuickDraw Mag',
    'Item_Attach_Weapon_Magazine_ExtendedQuickDraw_Small_C': 'Small Extended QuickDraw Mag',
    'Item_Attach_Weapon_Magazine_ExtendedQuickDraw_SniperRifle_C': 'Sniper Rifle Extended QuickDraw Mag',
    'Item_Attach_Weapon_Magazine_QuickDraw_Large_C': 'Large QuickDraw Mag',
    'Item_Attach_Weapon_Magazine_QuickDraw_Medium_C': 'Medium Quickdraw Mag',
    'Item_Attach_Weapon_Magazine_QuickDraw_Small_C': 'Small Quickdraw Mag',
    'Item_Attach_Weapon_Magazine_QuickDraw_SniperRifle_C': 'Sniper Rifle Quickdraw Mag',
    'Item_Attach_Weapon_Muzzle_Choke_C': 'Choke',
    'Item_Attach_Weapon_Muzzle_Compensator_Large_C': 'Large Compensator',
    'Item_Attach_Weapon_Muzzle_Compensator_Medium_C': 'Medium Compensator',
    'Item_Attach_Weapon_Muzzle_Compensator_SniperRifle_C': 'Sniper Rifle Compensator',
    'Item_Attach_Weapon_Muzzle_Duckbill_C': 'Duckbill',
    'Item_Attach_Weapon_Muzzle_FlashHider_Large_C': 'Large Flash Hider',
    'Item_Attach_Weapon_Muzzle_FlashHider_Medium_C': 'Medium Flash Hider',
    'Item_Attach_Weapon_Muzzle_FlashHider_SniperRifle_C': 'Sniper Rifle Flash Hider',
    'Item_Attach_Weapon_Muzzle_Suppressor_Large_C': 'Large Supressor',
    'Item_Attach_Weapon_Muzzle_Suppressor_Medium_C': 'Medium Supressor',
    'Item_Attach_Weapon_Muzzle_Suppressor_Small_C': 'Small Supressor',
    'Item_Attach_Weapon_Muzzle_Suppressor_SniperRifle_C': 'Sniper Rifle Supressor',
    'Item_Attach_Weapon_SideRail_DotSight_RMR_C': 'Canted Sight',
    'Item_Attach_Weapon_Stock_AR_Composite_C': 'Tactical Stock',
    'Item_Attach_Weapon_Stock_Shotgun_BulletLoops_C': 'Shotgun Bullet Loops',
    'Item_Attach_Weapon_Stock_SniperRifle_BulletLoops_C': 'Sniper Rifle Bullet Loops',
    'Item_Attach_Weapon_Stock_SniperRifle_CheekPad_C': 'Sniper Rifle Cheek Pad',
    'Item_Attach_Weapon_Stock_UZI_C': 'Uzi Stock',
    'Item_Attach_Weapon_Upper_ACOG_01_C': '4x ACOG Scope',
    'Item_Attach_Weapon_Upper_Aimpoint_C': '2x Aimpoint Scope',
    'Item_Attach_Weapon_Upper_CQBSS_C': '8x CQBSS Scope',
    'Item_Attach_Weapon_Upper_DotSight_01_C': 'Red Dot Sight',
    'Item_Attach_Weapon_Upper_Holosight_C': 'Holographic Sight',
    'Item_Attach_Weapon_Upper_PM2_01_C': '15x PM II Scope',
    'Item_Attach_Weapon_Upper_Scope3x_C': '3x Scope',
    'Item_Attach_Weapon_Upper_Scope6x_C': '6x Scope',
    'Item_Back_B_01_StartParachutePack_C': 'Parachute',
    'Item_Back_C_01_Lv3_C': 'Backpack (Level 3)',
    'Item_Back_C_02_Lv3_C': 'Backpack (Level 3)',
    'Item_Back_E_01_Lv1_C': 'Backpack (Level 1)',
    'Item_Back_E_02_Lv1_C': 'Backpack (Level 1)',
    'Item_Back_F_01_Lv2_C': 'Backpack (Level 2)',
    'Item_Back_F_02_Lv2_C': 'Backpack (Level 2)',
    'Item_Boost_AdrenalineSyringe_C': 'Adrenaline Syringe',
    'Item_Boost_EnergyDrink_C': 'Energy Drink',
    'Item_Boost_PainKiller_C': 'Painkiller',
    'Item_Ghillie_01_C': 'Ghillie Suit',
    'Item_Ghillie_02_C': 'Ghillie Suit',
    'Item_Ghillie_03_C': 'Ghillie Suit',
    'Item_Ghillie_04_C': 'Ghillie Suit',
    'Item_Head_E_01_Lv1_C': 'Motorcycle Helmet (Level 1)',
    'Item_Head_E_02_Lv1_C': 'Motorcycle Helmet (Level 1)',
    'Item_Head_F_01_Lv2_C': 'Military Helmet (Level 2)',
    'Item_Head_F_02_Lv2_C': 'Military Helmet (Level 2)',
    'Item_Head_G_01_Lv3_C': 'Spetsnaz Helmet (Level 3)',
    'Item_Heal_Bandage_C': 'Bandage',
    'Item_Heal_FirstAid_C': 'First Aid Kit',
    'Item_Heal_MedKit_C': 'Med kit',
    'Item_JerryCan_C': 'Gas Can',
    'Item_Weapon_AK47_C': 'AKM',
    'Item_Weapon_Apple_C': 'Apple',
    'Item_Weapon_AUG_C': 'AUG A3',
    'Item_Weapon_AWM_C': 'AWM',
    'Item_Weapon_Berreta686_C': 'S686',
    'Item_Weapon_BerylM762_C': 'Beryl',
    'Item_Weapon_BizonPP19_C': 'Bizon',
    'Item_Weapon_Cowbar_C': 'Crowbar',
    'Item_Weapon_Crossbow_C': 'Crossbow',
    'Item_Weapon_DesertEagle_C': 'Deagle',
    'Item_Weapon_DP28_C': 'DP-28',
    'Item_Weapon_FlareGun_C': 'Flare Gun',
    'Item_Weapon_FlashBang_C': 'Flashbang',
    'Item_Weapon_FNFal_C': 'SLR',
    'Item_Weapon_G18_C': 'P18C',
    'Item_Weapon_G36C_C': 'G36C',
    'Item_Weapon_Grenade_C': 'Frag Grenade',
    'Item_Weapon_Grenade_Warmode_C': 'Frag Grenade',
    'Item_Weapon_Groza_C': 'Groza',
    'Item_Weapon_HK416_C': 'M416',
    'Item_Weapon_Kar98k_C': 'Kar98k',
    'Item_Weapon_M16A4_C': 'M16A4',
    'Item_Weapon_M1911_C': 'P1911',
    'Item_Weapon_M249_C': 'M249',
    'Item_Weapon_M24_C': 'M24',
    'Item_Weapon_M9_C': 'P92',
    'Item_Weapon_Machete_C': 'Machete',
    'Item_Weapon_Mini14_C': 'Mini 14',
    'Item_Weapon_Mk14_C': 'Mk14 EBR',
    'Item_Weapon_Mk47Mutant_C': 'Mk47 Mutant',
    'Item_Weapon_Molotov_C': 'Molotov Cocktail',
    'Item_Weapon_MP5K_C': 'MP5K',
    'Item_Weapon_NagantM1895_C': 'R1895',
    'Item_Weapon_Pan_C': 'Pan',
    'Item_Weapon_QBU88_C': 'QBU88',
    'Item_Weapon_QBZ95_C': 'QBZ95',
    'Item_Weapon_Rhino_C': 'R45',
    'Item_Weapon_Saiga12_C': 'S12K',
    'Item_Weapon_Sawnoff_C': 'Sawed-off',
    'Item_Weapon_SCAR-L_C': 'SCAR-L',
    'Item_Weapon_Sickle_C': 'Sickle',
    'Item_Weapon_SKS_C': 'SKS',
    'Item_Weapon_SmokeBomb_C': 'Smoke Grenade',
    'Item_Weapon_Snowball_C': 'Snowball',
    'Item_Weapon_Thompson_C': 'Tommy Gun',
    'Item_Weapon_UMP_C': 'UMP9',
    'Item_Weapon_UZI_C': 'Micro Uzi',
    'Item_Weapon_Vector_C': 'Vector',
    'Item_Weapon_VSS_C': 'VSS',
    'Item_Weapon_vz61Skorpion_C': 'Skorpion',
    'Item_Weapon_Win1894_C': 'Win94',
    'Item_Weapon_Winchester_C': 'S1897',
    'WarModeStartParachutePack_C': 'Parachute',
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

function normalizeData(logs) {
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

    function addPlayerAttack(attacker, victim, elapsedTime) {
        if (attacker === null) return;

        data.playerAttacks.push({
            attacker: { location: normalizeLocation(attacker.location) },
            victim: { location: normalizeLocation(victim.location) },
            elapsedTime,
        });
    }

    if (!Array.isArray(logs)) {
        throw 'Invalid replay file format: replay file should be json array';
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
    let mapSize = mapSizes[matchStart.mapName];
    let ratio = 1 / mapSize / 100;

    let data = {
        meta: {
            mapName: mapNames[matchStart.mapName],
            terrain: matchStart.mapName,
            duration: 0,
            mapSize,
        },
        players: {},
        redZone: [],
        whiteCircle: [],
        safetyZone: [],
        carePackages: [],
        alivePlayers: [],
        playerAttacks: [],
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

            let items = itemPackage.items;
            for (let item of items) {
                item.itemName = itemNames[item.itemId];
            }

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
            addPlayerAttack(log.attacker, log.victim, elapsedTime);
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

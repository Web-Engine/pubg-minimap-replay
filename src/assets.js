import { Loader } from 'pixi.js';

import ErangelBackgroundHigh from './assets/maps/Erangel_Main_High_Res.png';
import ErangelBackgroundLow from './assets/maps/Erangel_Main_Low_Res.png';

import MiramarBackgroundHigh from './assets/maps/Miramar_Main_High_Res.png';
import MiramarBackgroundLow from './assets/maps/Miramar_Main_Low_Res.png';

import SanhokBackgroundHigh from './assets/maps/Sanhok_Main_High_Res.png';
import SanhokBackgroundLow from './assets/maps/Sanhok_Main_Low_Res.png';

import VikendiBackgrounHigh from './assets/maps/Vikendi_Main_High_Res.png';
import VikendiBackgrounLow from './assets/maps/Vikendi_Main_Low_Res.png';

const BackgroundAssets = {
    Erangel: {
        low: ErangelBackgroundLow,
        high: ErangelBackgroundHigh,
    },
    Miramar: {
        low: MiramarBackgroundLow,
        high: MiramarBackgroundHigh,
    },
    Sanhok: {
        low: SanhokBackgroundLow,
        high: SanhokBackgroundHigh,
    },
    Vikendi: {
        low: VikendiBackgrounLow,
        high: VikendiBackgrounHigh,
    },
};

const Background = {
    Erangel: {
        low: null,
        high: null,
    },
    Miramar: {
        low: null,
        high: null,
    },
    Sanhok: {
        low: null,
        high: null,
    },
    Vikendi: {
        low: null,
        high: null,
    },
};

import CarePackageFlying from './assets/icons/CarePackage_Flying.png';
import CarePackageNormal from './assets/icons/CarePackage_Normal.png';
import CarePackageOpen from './assets/icons/CarePackage_Open.png';

const Icon = {
    CarePackage: {
        Flying: null,
        Normal: null,
        Open: null,
    },
};

function loadTextures(mapName, useHigh, callback) {
    const loader = new Loader();

    if (!Icon.CarePackage.Flying) {
        loader.add('care-package-flying', CarePackageFlying);
    }

    if (!Icon.CarePackage.Normal) {
        loader.add('care-package-normal', CarePackageNormal);
    }

    if (!Icon.CarePackage.Open) {
        loader.add('care-package-open', CarePackageOpen);
    }

    if (useHigh) {
        if (!Background[mapName].high) {
            loader.add('background', BackgroundAssets[mapName].high);
        }
    }
    else if (!Background[mapName].low) {
        loader.add('background', BackgroundAssets[mapName].low);
    }

    loader.load((loader, resources) => {
        if (!Icon.CarePackage.Flying) {
            Icon.CarePackage.Flying = resources['care-package-flying'].texture;
        }

        if (!Icon.CarePackage.Normal) {
            Icon.CarePackage.Normal = resources['care-package-normal'].texture;
        }

        if (!Icon.CarePackage.Open) {
            Icon.CarePackage.Open = resources['care-package-open'].texture;
        }

        if (useHigh) {
            if (!Background[mapName].high) {
                Background[mapName].high = resources['background'].texture;
            }
        }
        else if (!Background[mapName].low) {
            Background[mapName].low = resources['background'].texture;
        }

        callback();
    });
}

export { loadTextures, Background, Icon };

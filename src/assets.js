// import ErangelBackgroundHigh from './assets/maps/Erangel_Main_High_Res.png';
// import ErangelBackgroundLow from './assets/maps/Erangel_Main_Low_Res.png';

// import MiramarBackgroundHigh from './assets/maps/Miramar_Main_High_Res.png';
// import MiramarBackgroundLow from './assets/maps/Miramar_Main_Low_Res.png';

// import SanhokBackgroundHigh from './assets/maps/Sanhok_Main_High_Res.png';
import SanhokBackgroundLow from './assets/maps/Sanhok_Main_Low_Res.png';

// import VikendiBackgrounHigh from './assets/maps/Vikendi_Main_High_Res.png';
// import VikendiBackgrounLow from './assets/maps/Vikendi_Main_Low_Res.png';

const Background = {
    // Erangel: {
    //     low: ErangelBackgroundHigh,
    //     high: ErangelBackgroundLow,
    // },
    // Miramar: {
    //     low: MiramarBackgroundHigh,
    //     high: MiramarBackgroundLow,
    // },
    Sanhok: {
        low: SanhokBackgroundLow,
        // high: SanhokBackgroundHigh,
    },
    // Vikendi: {
    //     low: VikendiBackgrounHigh,
    //     high: VikendiBackgrounLow,
    // },
};

import CarePackageFlying from './assets/icons/CarePackage_Flying.png';
import CarePackageNormal from './assets/icons/CarePackage_Normal.png';
import CarePackageOpen from './assets/icons/CarePackage_Open.png';

const Icon = {
    CarePackage: {
        Flying: CarePackageFlying,
        Normal: CarePackageNormal,
        Open: CarePackageOpen,
    },
};

export { Background, Icon };

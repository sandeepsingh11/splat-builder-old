import params from './params/latest-params.json';
import weaponInfo from './params/WeaponInfoMain.json';
import subInfo from './params/SubInfoMain.json';
import specialInfo from './params/SpecialInfoMain.json';
import hml from './params/hml.json';

export class LeannyService {
    version = 210;

    // sploosh-o-matic, rapid blaster, splat roller, splat charger, splat dulies, ink brush, heavy splatling, slosher, tenta brella, splatana wiper
    weaponIds = [0, 240, 1010, 2010, 5010, 1100, 4010, 3000, 6010, 8010];
    allAPs = [0, 10, 13];
    
    weaponParams: {[index: string]: any} = params.weapons;
    subParams: {[index: string]: any} = params.subs;
    specialParams: {[index: string]: any} = params.specials;

    weaponInfo = weaponInfo.filter((obj: { Type: string; }) => obj.Type === 'Versus');
    subInfo = subInfo.filter((obj: { Type: string; }) => obj.Type === 'Versus');
    specialInfo = specialInfo.filter((obj: { Type: string; }) => obj.Type === 'Versus');
    allHml: {[index: string]: number[]} = hml;

    printData: {weaponId: number, APs: number, effects: any}[] = [];
    
    constructor() {
        // power ups
        // this.calcIsm();
        // this.calcIss();
        // this.calcIru();
        // this.calcRsu();
        // this.calcSsu();
    }



    printEffect(effects: any, numOfAps: number, weaponId: number) {
        const data = {
            weaponId: weaponId,
            APs: numOfAps,
            effects: effects
        };
        this.printData.push(data);
    }

    calcIsm() {
        const effectName = 'ConsumeRt_Main';
        const hml = this.allHml[effectName];

        this.weaponIds.forEach(weaponId => {
            let inkConsume: number;
            switch (this.weaponParams[weaponId].WeaponName.split('_')[0]) {
                case 'Roller':
                    inkConsume = this.weaponParams[weaponId].GameParameters.WeaponVerticalSwingParam.InkConsume;
                    break;
                case 'Charger':
                    inkConsume = this.weaponParams[weaponId].GameParameters.WeaponParam.InkConsumeFullCharge;
                    break;
                case 'Brush':
                    inkConsume = this.weaponParams[weaponId].GameParameters.WeaponSwingParam.InkConsume;
                    break;
                case 'Shelter':
                    inkConsume = this.weaponParams[weaponId].GameParameters.spl__WeaponShelterShotgunParam.InkConsume; // shots TODO: nonextistant for 6000
                    // inkConsume = this.weaponParams[weaponId].GameParameters.spl__WeaponShelterCanopyParam.InkConsumeUmbrella; // shield launches
                    break;
                case 'Saber':
                    inkConsume = this.weaponParams[weaponId].GameParameters.spl__WeaponSaberParam.ChargeParam.InkConsumeFullCharge;
                    // inkConsume = this.weaponParams[weaponId].GameParameters.spl__WeaponSaberParam.SwingParam.InkConsume; // TODO enable both
                    break;
                default:
                    inkConsume = this.weaponParams[weaponId].GameParameters.WeaponParam.InkConsume;
                    break;
            }

            this.allAPs.forEach((APs) => {
                const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
                const effects = [
                    // {
                    //   name: 'Ink Consumption / Shot',
                    //   value: parseFloat((result[0] * inkConsume).toFixed(5)),
                    //   percent: parseFloat((result[1] * 100).toFixed(2)),
                    // },
                    {
                        name: 'Max Number of Shots',
                        value: (1.0 / (result[0] * inkConsume)).toFixed(2), // TODO: fetch inkConsume || InkConsumeFullCharge (charger)
                        percent: parseFloat((result[1] * 100).toFixed(2)),
                    },
                ];

                this.printEffect(effects, APs, weaponId);
            });
        });

        return this.printData;
    }

    calcIss() {
        this.weaponIds.forEach(weaponId => {
            let consumeLvl = 2;
            let inkConsume = 0.7;

            for (let obj of this.weaponInfo) {
                if (obj.Id === weaponId) {
                    const subFullName = obj.SubWeapon.split('.');
                    const subName = subFullName[0].split('/')[2];

                    Object.keys(params.subs).forEach(subId => {
                        const sub = this.subParams[subId];
                        
                        if (sub.SubName === subName) {
                            if ('SubWeaponSetting' in sub.GameParameters) {
                                consumeLvl = sub.GameParameters.SubWeaponSetting.SubInkSaveLv ?? 2;
                            }

                            if ('WeaponParam' in sub.GameParameters) {
                                inkConsume = sub.GameParameters.WeaponParam.InkConsume ?? 0.7;
                            }

                        }
                    });
                    break;
                }
            };

            const hml = this.allHml['ConsumeRt_Sub_Lv' + consumeLvl.toString()];

            this.allAPs.forEach((APs) => {
                const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
                
                const effects = [
                    {
                    name: 'Ink Consumption',
                    value: parseFloat((result[0] * inkConsume * 100).toFixed(2)),
                    percent: parseFloat((result[1] * 100).toFixed(2)),
                    },
                ];
                
                this.printEffect(effects, APs, weaponId);
            });
        });

        return this.printData;
    }

    calcIru() {
        const effectName = ['InkRecoverFrm_Std','InkRecoverFrm_Stealth'];
        const hmlSquid = this.allHml[effectName[1]];
        const hmlHuman = this.allHml[effectName[0]];

        this.weaponIds.forEach(weaponId => {
            this.allAPs.forEach((APs) => {
                const resultSquid = this.calculateAbilityEffect(APs, hmlSquid[0], hmlSquid[1], hmlSquid[2]);
                const resultHuman = this.calculateAbilityEffect(APs, hmlHuman[0], hmlHuman[1], hmlHuman[2]);
                
                const effects = [
                    {
                    name: 'Recovery Time in Ink - Seconds',
                    value: parseFloat((Math.ceil(resultSquid[0]) / 60).toFixed(2)),
                    percent: parseFloat((resultSquid[1] * 100).toFixed(2)),
                    },
                    {
                    name: 'Recovery Time Standing - Seconds',
                    value: parseFloat((Math.ceil(resultHuman[0]) / 60).toFixed(2)),
                    percent: parseFloat((resultHuman[1] * 100).toFixed(2)),
                    }
                ];
                
                this.printEffect(effects, APs, weaponId);
            });
        });

        return this.printData;
    }

    calcRsu() {   
        this.weaponIds.forEach(weaponId => {
            // run speed
            const moveVel = this.weaponParams[weaponId].GameParameters.MainWeaponSetting.WeaponSpeedType ?? 'Mid';
            const moveVelKey = `MoveVel_Human${(moveVel !== 'Mid') ? '_' + moveVel : ''}`;
            const hmlMoving = this.allHml[moveVelKey];
            
            // run speed shooting
            const gameParams = this.weaponParams[weaponId].GameParameters;
            const shootingVel = (gameParams.WeaponParam) 
                ? gameParams.WeaponParam.MoveSpeed ??
                    gameParams.WeaponParam.MoveSpeedFullCharge
                : (gameParams.spl__WeaponShelterShotgunParam)
                    ? gameParams.spl__WeaponShelterShotgunParam.MoveSpeed 
                    : null
            const hmlShooting = (!(this.weaponParams[weaponId].WeaponName.includes('Spinner')))
                ? this.allHml['MoveVelRt_Shot']
                : [
                    gameParams.MainWeaponSetting.Overwrite_MoveVelRt_Shot_High,
                    gameParams.MainWeaponSetting.Overwrite_MoveVelRt_Shot_Mid,
                    gameParams.MainWeaponSetting.Overwrite_MoveVelRt_Shot_Low,
                ];

            this.allAPs.forEach((APs) => {
                let effects = [];
                
                // run speed
                const resultMoving = this.calculateAbilityEffect(APs, hmlMoving[0], hmlMoving[1], hmlMoving[2]);
                const runSpeedEffect = {
                    name: 'Run Speed (DU/Frame)',
                    value: parseFloat((resultMoving[0] * 10).toFixed(3)),
                    percent: parseFloat((resultMoving[1] * 100).toFixed(2))
                };
                effects.push(runSpeedEffect);
        
                // run speed shooting (if applicable)
                if (shootingVel !== null) {
                    const resultShooting = this.calculateAbilityEffect(APs, hmlShooting[0], hmlShooting[1], hmlShooting[2]);
                    const runSpeedEffectShooting = {
                        name: 'Run Speed (Shooting) (DU/Frame)',
                        value: parseFloat((resultShooting[0] * shootingVel * 10).toFixed(3)),
                        percent: parseFloat((resultShooting[1] * 100).toFixed(2))
                    };
                    effects.push(runSpeedEffectShooting);
                }
                
                this.printEffect(effects, APs, weaponId);
            });
        });

        return this.printData;
    }

    // TODO add rainmaker?
    calcSsu() {
        this.weaponIds.forEach(weaponId => {
            const moveVel = this.weaponParams[weaponId].GameParameters.MainWeaponSetting.WeaponSpeedType ?? 'Mid';
            const moveVelKey = `MoveVel_Stealth${(moveVel !== 'Mid') ? '_' + moveVel : ''}`;
            const hml = this.allHml[moveVelKey];
            
            this.allAPs.forEach(APs => {
                const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
                const ns = (false) ? 0.9 : 1; // TODO handle ninja squid
                let effects = [];
            
                const swimSpeedEffect = {
                    name: 'Swim Speed (DU/Frame)',
                    value: parseFloat((result[0] * ns * 10).toFixed(3)),
                    percent: parseFloat((result[1] * 100).toFixed(2)),
                };
                effects.push(swimSpeedEffect);

                this.printEffect(effects, APs, weaponId);
            });
        });

        return this.printData;
    }

    calcScu() {
        const effectName = 'IncreaseRt_Special';
        const hml = this.allHml[effectName];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcSsv() {
        const effectName = 'SpecialGaugeRt_Restart';
        const hml = this.allHml[effectName];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcSpu() {
        const effectName = [
            'InkVacRadiusMin',
            'InkVacRadiusMax',
            'CrabTankSpecialTotalFrame',
            'TacticoolerPowerUpFrame',
            'BigBubblerMaxFieldHP',
            'BigBubblerMaxHP',
            'InkStormRainyFrame',
            'InkStormSpawnSpeedZSpecUp',
            'InkjetSpecialTotalFrame',
            'InkjetBurstPaintRadius',
            'InkjetDistanceDamageDistanceRate',
            'InkjetSplashAroundVelocityMin',
            'InkjetSplashAroundVelocityMax',
            'InkjetSplashAroundPaintRadius',
            'KillerWailLaserFrame',
            'TentaMissilesTargetIncircleRadius',
            'TentaMissilesBurstPaintRadius',
            'BooyahBombChargeRateAutoPerFrame',
            'WaveBreakerMaxFrame',
            'WaveBreakerMaxRadius',
            'ReefsliderDistanceDamageDistanceRate',
            'ReefsliderPaintRadius',
            'ReefsliderSplashAroundVelocityMin',
            'ReefsliderSplashAroundVelocityMax',
            'ReefsliderSplashAroundPaintRadius',
            'ZipcasterInkConsume_Hook',
            'ZipcasterInkConsume_PerSec',
            'TripleInkstrikeSpawnSpeedZSpecUp',
            'TrizookaSpecialDurationFrame',
            'TrizookaPaintRadius',
            'TrizookaDistanceDamageDistanceRate',
            'UltraStampSpecialDurationFrame'
        ];
        const hml = this.allHml[effectName[0]];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcQrs() {
        const effectName = ['Dying_AroundFrm','Dying_ChaseFrm'];
        const hml = this.allHml[effectName[0]];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcQsj() {
        const effectName = ['SuperJump_ChargeFrm','SuperJump_MoveFrm'];
        const hml = this.allHml[effectName[0]];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcSubpu() {
        const effectName = [
            'BeakonJumpFrame',
            'CurlingZSpecUp',
            'FizzyZSpecUp',
            'BurstZSpecUp',
            'AutoZSpecUp-table',
            'SplatZSpecUp-table',
            'SuctionZSpecUp-table',
            'TorpedoZSpecUp-table',
            'AngleMarkingFrm-table',
            'AngleZSpecUp-table',
            'PointSensorMarkingFrm-table',
            'PointSensorZSpecUp-table',
            'ToxicMistZSpecUp-table',
            'SplashWallMaxHP-table',
            'SprinklerFirstFrm-table',
            'SprinklerSecondFrm-table',
            'MineDistance-table',
            'MineMarkingFrm-table',
            'MineDistanceDamageDistanceRate-table',
            'MineSensorRadius-table',
        ];
        const hml = this.allHml[effectName[0]];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcIresistu() {
        const effectName = [
            'OpInk_ArmorHP-table',
            'OpInk_DamageLmt-table',
            'OpInk_DamagePerFrame-table',
            'OpInk_JumpVel-table',
            'OpInk_MoveVel-table',
            'OpInk_MoveVel_Shot-table',
            'OpInk_MoveVel_ShotK-table',
        ];
        const hml = this.allHml[effectName[0]];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcSru() {
        const effectName = [
            'DamageRt_BombH-table',
            'DamageRt_BombL-table',
            'DamageRt_LineMarker-table',
            'DamageRt_Shield-table',
            'DamageRt_Sprinkler-table',
            'MarkingTimeRt-table',
            'MarkingTimeRt_Trap-table',
            'MoveDownRt_PoisonMist-table',
        ];
        const hml = this.allHml[effectName[0]];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcIta() {
        const effectName = [
            'Somersault_MoveVelKd-table',
            'WallJumpChargeFrm-table',
            'ReduceJumpSwerveRate-table',
            'ReduceJumpSwerveRate-Blaster-table',
        ];
        const hml = this.allHml[effectName[0]];
        this.allAPs.forEach((APs) => {
            const result = this.calculateAbilityEffect(APs, hml[0], hml[1], hml[2]);
            console.log(`APs: ${APs} - ${result}`);
        });
    }

    calcOpg() {
        this.calcRsu(); // 30ap
        this.calcSsu(); // 30ap
        this.calcIresistu(); // 30ap
    }

    calcLde() {
        this.calcIsm(); // depends...
        this.calcIss(); // depends...
        this.calcIru(); // depends...
    }

    calcCbk() {
        this.calcIsm(); // 10ap
        this.calcIss(); // 10ap
        this.calcIru(); // 10ap
        this.calcRsu(); // 10ap
        this.calcSsu(); // 10ap
        this.calcScu(); // 10ap
    }

    calcNjs() {
        // ssu -10%
    }

    calcRsp() {
        // ...
    }

    calcOjs() {
        // TODO
    }

    calcDrl() {
        // TODO
    }







    calculateAbilityEffect(
        // numOfMains,
        // numOfSubs,
        APs: number,
        high: number,
        mid: number,
        low: number,
        ninjaSquid = false
        ) {
        // var APs = getAPs(numOfMains, numOfSubs);
        // let APs = 6;
        var percentage = this.getPercentage(APs);
        if (ninjaSquid) percentage *= 0.8;
        var slope = this.getSlope(high, mid, low);
        var lerpN = this.getLerpN(percentage / 100, slope);
        var result = this.getResult(high, low, lerpN);
        if (ninjaSquid) result *= 0.9;

        return [result, lerpN];
    }

    // main, sub to AP points
    getAPs(numOfMains: number, numOfSubs: number) {
        return 10 * numOfMains + 3 * numOfSubs;
    }

    // percent difference
    getPercentage(AP: number) {
        return Math.min(3.3 * AP - 0.027 * Math.pow(AP, 2), 100);
    }

    // slope
    getSlope(high: number, mid: number, low: number) {
        if (mid === low) return 0;

        return (mid - low) / (high - low);
    }

    // lerpN
    getLerpN(percentage: number, slope: number) {
        if (
            parseInt(slope.toFixed(3)) == 0.5 ||
            percentage === 0.0 ||
            percentage === 1.0
        ) {
            return percentage;
        } else {
            // slope != 0.5
            return Math.pow(
                Math.E,
                -1 * ((Math.log(percentage) * Math.log(slope)) / Math.log(2))
            );
        }
    }

    // result
    getResult(high: number, low: number, lerpN: number) {
        return low + (high - low) * lerpN;
    }

    getHML_MWPUG(data: any, key: string) {
        var high = 0;
        var mid = 0;
        var low = 0;

        if (
            data[key + '_MWPUG_High'] === 0 ||
            data[key + '_MWPUG_High'] === 0.0 ||
            data['Stand_' + key + '_MWPUG_High'] === 0 ||
            data['Jump_' + key + '_MWPUG_High'] === 0 ||
            data['Stand_' + key + '_MWPUG_High'] === 0.0 ||
            data['Jump_' + key + '_MWPUG_High'] === 0.0
        ) {
            high = 0.0;
        } else {
            high =
            data[key + '_MWPUG_High'] ||
            data['Stand_' + key + '_MWPUG_High'] ||
            data['Jump_' + key + '_MWPUG_High'];
        }

        if (
            data[key + '_MWPUG_Mid'] === 0 ||
            data[key + '_MWPUG_Mid'] === 0.0 ||
            data['Stand_' + key + '_MWPUG_Mid'] === 0 ||
            data['Jump_' + key + '_MWPUG_Mid'] === 0 ||
            data['Stand_' + key + '_MWPUG_Mid'] === 0.0 ||
            data['Jump_' + key + '_MWPUG_Mid'] === 0.0
        ) {
            mid = 0.0;
        } else {
            mid =
            data[key + '_MWPUG_Mid'] ||
            data['Stand_' + key + '_MWPUG_Mid'] ||
            data['Jump_' + key + '_MWPUG_Mid'];
        }

        if (
            data[key] === 0 ||
            data[key] === 0.0 ||
            data['Stand_' + key] === 0 ||
            data['Jump_' + key] === 0 ||
            data['Stand_' + key] === 0.0 ||
            data['Jump_' + key] === 0.0
        ) {
            low = 0.0;
        } else {
            low = data[key] || data['Stand_' + key] || data['Jump_' + key] || 1.0;
        }

        return [high, mid, low];
    }

    // convert AP to main and sub points
    getMainSubPoints(ap: number) {
        var main = 0;
        var sub = 0;

        while (ap >= 10) {
            main++;
            ap -= 10;
        }

        sub = ap / 3;

        return [main, sub];
    }
}
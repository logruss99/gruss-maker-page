/**
 * Moon Base Simulator — Calculation Engine
 * Source of truth: "Lunar Base? Answering With First Principles" by L. Gruss
 *
 * All baseline constants and formulas are drawn from the article.
 * Parameters marked [adjustable] can be tuned by the user; article defaults
 * are preserved as the starting values.
 */

/* ===================================================================
   CONSTANTS  (article-grounded)
   =================================================================== */
const LUNAR = Object.freeze({
    gravity:          1.62,          // m/s²
    gravityFraction:  0.165,         // fraction of Earth g
    solarDay:         29.53,         // Earth days
    darkHalf:         14.765,        // Earth days (equatorial worst case)
    solarIrradiance:  1361.6,        // W/m²
    regolithDensity:  1500,          // kg/m³
    stefanBoltzmann:  5.670374419e-8 // W m⁻² K⁻⁴
});

const TRANSPORT = Object.freeze({
    dv_surface_LEO:   9.4,   // km/s
    dv_LEO_TLI:       3.2,   // km/s
    dv_LOI:           0.9,   // km/s  (mid-range 0.8–1.0)
    dv_descent:       1.6,   // km/s
    dv_total:         15.1   // km/s  representative Earth-surface → Moon-surface
});

/* ===================================================================
   SCALE CLASS PRESETS
   =================================================================== */
const SCALE_PRESETS = {
    SRO: {
        label: 'Small Robotic Outpost',
        shortLabel: 'SRO',
        deliveredMass:    15,      // tonnes (mid 10–20)
        continuousPower:  15,      // kW     (mid 10–20)
        crewCount:        0,
        missionDays:      365,
        habitatFootprint: 0,
        habitatRadius:    0,
        regolithCover:    0,
        internalPressure: 0,
        solarEfficiency:  0.30,
        deratingFactor:   0.70,
        nightDays:        14.765,
        batterySpecEnergy:250,
        recycleO2:        0,
        recycleH2O:       0,
        dustSeverity:     0.5,
        radiationSeverity:0.6,
        roboticsFraction: 1.0,
        isruMaturity:     0.0,
        localShieldFrac:  0.0,
        costPerKg:        15000,
        logisticsOverhead:1.15,
        siteType:         'equatorial',
        habitatGeometry:  'cylinder',
        description: 'Uncrewed geology, comms relay, site prep, robotic excavation, tech demo'
    },
    HRB: {
        label: 'Human-Tended Research Base',
        shortLabel: 'HRB',
        deliveredMass:    75,
        continuousPower:  75,
        crewCount:        2,
        missionDays:      45,
        habitatFootprint: 30,
        habitatRadius:    2.5,
        regolithCover:    0.3,
        internalPressure: 70,
        solarEfficiency:  0.30,
        deratingFactor:   0.70,
        nightDays:        14.765,
        batterySpecEnergy:250,
        recycleO2:        0.3,
        recycleH2O:       0.4,
        dustSeverity:     0.6,
        radiationSeverity:0.7,
        roboticsFraction: 0.6,
        isruMaturity:     0.1,
        localShieldFrac:  0.2,
        costPerKg:        15000,
        logisticsOverhead:1.20,
        siteType:         'polar',
        habitatGeometry:  'cylinder',
        description: 'Short campaigns, local construction tests, limited ISRU, emergency shelter'
    },
    PSB: {
        label: 'Permanent Scientific Base',
        shortLabel: 'PSB',
        deliveredMass:    500,
        continuousPower:  250,
        crewCount:        6,
        missionDays:      365,
        habitatFootprint: 100,
        habitatRadius:    4,
        regolithCover:    0.8,
        internalPressure: 70,
        solarEfficiency:  0.30,
        deratingFactor:   0.70,
        nightDays:        3,
        batterySpecEnergy:250,
        recycleO2:        0.75,
        recycleH2O:       0.85,
        dustSeverity:     0.7,
        radiationSeverity:0.5,
        roboticsFraction: 0.4,
        isruMaturity:     0.4,
        localShieldFrac:  0.7,
        costPerKg:        12000,
        logisticsOverhead:1.25,
        siteType:         'polar',
        habitatGeometry:  'cylinder',
        description: 'Continuous science, drilling, astronomy, polar ice, shielded habitation'
    },
    IS: {
        label: 'Industrial Settlement',
        shortLabel: 'IS',
        deliveredMass:    5000,
        continuousPower:  3000,
        crewCount:        24,
        missionDays:      730,
        habitatFootprint: 400,
        habitatRadius:    6,
        regolithCover:    1.2,
        internalPressure: 70,
        solarEfficiency:  0.30,
        deratingFactor:   0.70,
        nightDays:        1,
        batterySpecEnergy:250,
        recycleO2:        0.92,
        recycleH2O:       0.95,
        dustSeverity:     0.8,
        radiationSeverity:0.4,
        roboticsFraction: 0.7,
        isruMaturity:     0.7,
        localShieldFrac:  0.9,
        costPerKg:        10000,
        logisticsOverhead:1.30,
        siteType:         'polar',
        habitatGeometry:  'buried_cylinder',
        description: 'Bulk processing, propellant production, construction export, manufacturing'
    }
};

/* ===================================================================
   CALCULATION ENGINE
   =================================================================== */
const SimEngine = {

    /* ---------- Solar Array Area ---------- */
    solarArrayArea(params) {
        const peakWperm2 = LUNAR.solarIrradiance * params.solarEfficiency;
        const effectiveWperm2 = peakWperm2 * params.deratingFactor;
        // need to generate enough during lit period to cover continuous load
        const powerKW = params.continuousPower;
        return (powerKW * 1000) / effectiveWperm2; // m²
    },

    /* ---------- Night-Storage ---------- */
    nightStorage(params) {
        const energyKWh = params.continuousPower * params.nightDays * 24;
        const energyMWh = energyKWh / 1000;
        const massKg = energyKWh * 1000 / params.batterySpecEnergy; // Wh / (Wh/kg)
        return { energyMWh, massKg, massTonnes: massKg / 1000 };
    },

    /* ---------- Shielding ---------- */
    shielding(params) {
        const arealDensity = LUNAR.regolithDensity * params.regolithCover; // kg/m²
        const totalMassKg = arealDensity * params.habitatFootprint;
        const importedFrac = 1 - params.localShieldFrac;
        const importedKg = totalMassKg * importedFrac;
        return {
            arealDensity,
            totalMassKg,
            totalMassTonnes: totalMassKg / 1000,
            importedKg,
            importedTonnes: importedKg / 1000,
            localKg: totalMassKg - importedKg
        };
    },

    /* ---------- Thermal Rejection (Stefan–Boltzmann) ---------- */
    radiatorArea(params) {
        const wasteHeatW = params.continuousPower * 1000 * 0.65; // ~65% becomes waste
        const emissivity = 0.9;
        const tempK = 300;
        const fluxWperm2 = emissivity * LUNAR.stefanBoltzmann * Math.pow(tempK, 4);
        return { areaM2: wasteHeatW / fluxWperm2, wasteHeatKW: wasteHeatW / 1000 };
    },

    /* ---------- Pressure Loads ---------- */
    pressureLoads(params) {
        if (params.crewCount === 0) return { forceMN: 0, areaCap: 0 };
        const pressurePa = params.internalPressure * 1000; // kPa → Pa
        const r = params.habitatRadius;
        const bulkheadArea = Math.PI * r * r; // m²
        const forceN = pressurePa * bulkheadArea;
        return { forceMN: forceN / 1e6, areaCap: bulkheadArea };
    },

    /* ---------- Life Support ---------- */
    lifeSupport(params) {
        const crew = params.crewCount;
        if (crew === 0) return { waterKgDay: 0, o2KgDay: 0, waterTotalKg: 0, o2TotalKg: 0 };
        const waterBase = 2.5;   // kg/person/day
        const o2Base    = 0.83;  // kg/person/day
        const waterKgDay = crew * waterBase * (1 - params.recycleH2O);
        const o2KgDay    = crew * o2Base    * (1 - params.recycleO2);
        const days = params.missionDays;
        return {
            waterKgDay,
            o2KgDay,
            waterTotalKg: waterKgDay * days,
            o2TotalKg:    o2KgDay * days,
            waterTotalTonnes: (waterKgDay * days) / 1000,
            o2TotalTonnes:    (o2KgDay * days) / 1000
        };
    },

    /* ---------- Cost Model ---------- */
    costModel(params) {
        const shieldImported = this.shielding(params).importedKg;
        const batteryMass    = this.nightStorage(params).massKg;
        const lsWater        = this.lifeSupport(params).waterTotalKg;
        const lsO2           = this.lifeSupport(params).o2TotalKg;
        const baseMass       = params.deliveredMass * 1000; // tonnes → kg

        const totalDeliveredKg = (baseMass + shieldImported + lsWater + lsO2) * params.logisticsOverhead;
        const totalCostUSD = totalDeliveredKg * params.costPerKg;

        return {
            totalDeliveredKg,
            totalDeliveredTonnes: totalDeliveredKg / 1000,
            totalCostUSD,
            costBillions: totalCostUSD / 1e9,
            breakdown: {
                baseStructure: baseMass * params.costPerKg,
                shielding: shieldImported * params.costPerKg * params.logisticsOverhead,
                storage: batteryMass * params.costPerKg * params.logisticsOverhead,
                lifeSupport: (lsWater + lsO2) * params.costPerKg * params.logisticsOverhead
            }
        };
    },

    /* ---------- Damage / Reliability Model ---------- */
    reliabilityModel(params) {
        // Simplified index model 0–100 (lower = better)
        const dustScore      = params.dustSeverity * 25;
        const thermalCycling = (params.nightDays / 14.765) * 20;
        const radiationScore = params.radiationSeverity * 20;
        const movingParts    = (1 - params.roboticsFraction) * 10 + params.roboticsFraction * 15;
        const fragility      = params.crewCount > 0 ? 10 : 5;
        const redundancy     = params.deliveredMass > 500 ? -8 : (params.deliveredMass > 100 ? -4 : 0);
        const crewMaintBonus = params.crewCount > 0 ? -5 : 5;

        const raw = dustScore + thermalCycling + radiationScore + movingParts + fragility + redundancy + crewMaintBonus;
        const index = Math.max(0, Math.min(100, raw));

        let label;
        if (index < 25) label = 'Low';
        else if (index < 50) label = 'Moderate';
        else if (index < 75) label = 'Severe';
        else label = 'Critical';

        return {
            index: Math.round(index),
            label,
            components: {
                dust: Math.round(dustScore),
                thermalCycling: Math.round(thermalCycling),
                radiation: Math.round(radiationScore),
                movingParts: Math.round(movingParts),
                fragility: Math.round(fragility),
                redundancy: Math.round(redundancy),
                crewMaint: Math.round(crewMaintBonus)
            }
        };
    },

    /* ---------- Plausibility Classification ---------- */
    plausibility(params) {
        const cost = this.costModel(params);
        const storage = this.nightStorage(params);
        const shield = this.shielding(params);

        let score = 100; // start optimistic
        // penalize extreme battery mass
        if (storage.massTonnes > 500) score -= 30;
        else if (storage.massTonnes > 100) score -= 15;
        // penalize extreme imported shielding
        if (shield.importedTonnes > 200) score -= 25;
        else if (shield.importedTonnes > 50) score -= 10;
        // penalize extreme cost
        if (cost.costBillions > 200) score -= 30;
        else if (cost.costBillions > 50) score -= 15;
        // penalize crew with low recycling
        if (params.crewCount > 0 && params.recycleH2O < 0.5) score -= 10;
        // bonus for polar site
        if (params.siteType === 'polar') score += 5;
        // bonus for high ISRU
        if (params.isruMaturity > 0.5) score += 5;

        score = Math.max(0, Math.min(100, score));

        let label;
        if (score >= 80) label = 'Highly Plausible';
        else if (score >= 60) label = 'Plausible';
        else if (score >= 40) label = 'Constrained';
        else if (score >= 20) label = 'Marginal';
        else label = 'Implausible';

        return { score, label };
    },

    /* ---------- Full Scenario Compute ---------- */
    compute(params) {
        return {
            params,
            solarArray:    this.solarArrayArea(params),
            nightStorage:  this.nightStorage(params),
            shielding:     this.shielding(params),
            radiator:      this.radiatorArea(params),
            pressure:      this.pressureLoads(params),
            lifeSupport:   this.lifeSupport(params),
            cost:          this.costModel(params),
            reliability:   this.reliabilityModel(params),
            plausibility:  this.plausibility(params)
        };
    }
};

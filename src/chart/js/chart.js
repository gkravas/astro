"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const planet_1 = require("./planet");
const aspect_1 = require("./aspect");
const path = require("path");
const swisseph = require('swisseph');
let strtime = function (value) {
    var hour = Math.floor(value);
    var minFrac = (value - hour) * 60;
    var min = Math.floor(minFrac);
    var sec = Math.floor((minFrac - min) * 60);
    return hour + ' ' + min + ' ' + sec;
};
let logbody = function (name, body) {
    var lang = body.longitude;
    var house = Math.floor(lang / 30);
    var lang30 = lang - house * 30;
    console.log(name + ':', body.longitude, '|', strtime(lang30), '|', house, body.longitudeSpeed < 0 ? 'R' : '');
};
const planetsEnums = {
    'sun': swisseph.SE_SUN,
    'moon': swisseph.SE_MOON,
    'mercury': swisseph.SE_MERCURY,
    'venus': swisseph.SE_VENUS,
    'mars': swisseph.SE_MARS,
    'jupiter': swisseph.SE_JUPITER,
    'saturn': swisseph.SE_SATURN,
    'uranus': swisseph.SE_URANUS,
    'neptune': swisseph.SE_NEPTUNE,
    'pluto': swisseph.SE_PLUTO,
    'north node': swisseph.SE_MEAN_NODE,
    'south node': swisseph.SE_MEAN_NODE,
    'chiron': swisseph.SE_CHIRON
};
var ChartType;
(function (ChartType) {
    ChartType[ChartType["Basic"] = 0] = "Basic";
    ChartType[ChartType["Transits"] = 1] = "Transits";
    ChartType[ChartType["Synastry"] = 2] = "Synastry";
    ChartType[ChartType["Combined"] = 3] = "Combined";
    ChartType[ChartType["Davison"] = 4] = "Davison";
    ChartType[ChartType["CombinedTransits"] = 5] = "CombinedTransits";
    ChartType[ChartType["DavisonTransits"] = 6] = "DavisonTransits";
})(ChartType = exports.ChartType || (exports.ChartType = {}));
class Chart {
    constructor(name, p1, cdata, p2, type = ChartType.Basic) {
        this.name = name;
        this.p1 = p1;
        this.p2 = p2;
        this.type = type;
        this._debug = false;
        this._signs = [
            { name: "aries", symbol: "q", v: 1 },
            { name: "taurus", symbol: "w", v: 1 },
            { name: "gemini", symbol: "e", v: 1 },
            { name: "cancer", symbol: "r", v: 1 },
            { name: "leo", symbol: "t", v: 1 },
            { name: "virgo", symbol: "z", v: 1 },
            { name: "libra", symbol: "u", v: 1 },
            { name: "scorpio", symbol: "i", v: 1 },
            { name: "sagittarius", symbol: "o", v: 1 },
            { name: "capricorn", symbol: "p", v: 1 },
            { name: "aquarius", symbol: "ü", v: 1 },
            { name: "pisces", symbol: "+", v: 1 }
        ];
        let pdata;
        switch (type) {
            case ChartType.Combined:
                pdata = this.calculateCombinedPlanets(cdata);
                this._planets1 = this.getPlanets(pdata);
                this._ascendant = pdata.ascendant;
                this._houses = pdata.houses;
                break;
            case ChartType.CombinedTransits:
                pdata = this.calculateCombinedPlanets(cdata);
                this._planets1 = this.getPlanets(pdata);
                this._planets2 = this.getPlanets(cdata[2]);
                this._ascendant = pdata.ascendant;
                this._houses = pdata.houses;
                break;
            default:
                this._planets1 = this.getPlanets(cdata[0]);
                if (cdata[1]) {
                    this._planets2 = this.getPlanets(cdata[1]);
                }
                this._ascendant = cdata[0].ascendant;
                this._houses = cdata[0].houses;
                break;
        }
        this.calculateAspects();
    }
    /**
     * Extracts planet data from ChartData and creates Planet objects for each one
     * @param  {ChartData}     cdata JSON data returned from morphemeris REST API
     * @return {Array<Planet>}       An array of Planet objects
     */
    getPlanets(cdata) {
        let planets = [];
        for (let p in cdata.planets) {
            let pd = cdata.planets[p];
            if (!pd.name) {
                continue;
            }
            planets.push(new planet_1.Planet(pd.name, pd.lon, pd.lat, pd.spd));
        }
        return planets;
    }
    /**
     * Calculates the aspects between planets in the chart
     */
    calculateAspects() {
        this._aspects = [];
        if (!this._planets2) {
            // calculate aspects within the _planets1 array
            for (let i in this._planets1) {
                for (let j in this._planets1) {
                    if (i !== j && j > i) {
                        try {
                            this._aspects.push(new aspect_1.Aspect(this._planets1[i], this._planets1[j]));
                        }
                        catch (err) {
                            if (this._debug)
                                console.error(err);
                        }
                    }
                }
            }
        }
        else {
            // calculate aspects between the _planets1 and _planets2 arrays
            for (let i in this._planets1) {
                for (let j in this._planets2) {
                    try {
                        this._aspects.push(new aspect_1.Aspect(this._planets1[i], this._planets2[j]));
                    }
                    catch (err) {
                        if (this._debug)
                            console.error(err);
                    }
                }
            }
        }
    }
    /**
     * Calculates longitudes for a combined chart
     * @param {ChartData} p1 Planet data from person one
     * @param {ChartData} p2 Planet data from person two
     */
    calculateCombinedPlanets(cdata) {
        let cd = { "planets": { "sun": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "moon": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "mercury": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "venus": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "mars": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "jupiter": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "saturn": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "uranus": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "neptune": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "pluto": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "north node": { "name": "north node", "lon": null, "lat": null, "spd": null, "r": null }, "south node": { "name": "south node", "lon": null, "lat": null, "spd": null, "r": null }, "chiron": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "pholus": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "ceres": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "pallas": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "juno": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "vesta": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "cupido": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "chariklo": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "chaos": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "eris": { "name": null, "lon": null, "lat": null, "spd": null, "r": null }, "nessus": { "name": null, "lon": null, "lat": null, "spd": null, "r": null } }, "houses": [null, null, null, null, null, null, null, null, null, null, null, null], "ascendant": null, "mc": null };
        for (let p in cdata[0].planets) {
            cd.planets[p].name = p;
            cd.planets[p].lon = this.getLonMidpoint(cdata[0].planets[p].lon, cdata[1].planets[p].lon);
            cd.planets[p].lat = (cdata[0].planets[p].lat + cdata[1].planets[p].lat) / 2;
            cd.planets[p].spd = (cdata[0].planets[p].spd + cdata[1].planets[p].spd) / 2;
        }
        for (let h in cdata[0].houses) {
            cd.houses[h] = this.getLonMidpoint(cdata[0].houses[h], cdata[1].houses[h]);
        }
        cd.ascendant = this.getLonMidpoint(cdata[0].ascendant, cdata[1].ascendant);
        cd.mc = this.getLonMidpoint(cdata[0].mc, cdata[1].mc);
        return cd;
    }
    /**
     * Finds the midpoint between two planets on the "short" side
     * @param  {number} l1 Longitude of planet one
     * @param  {number} l2 Longitude of planet two
     * @return {number}    Longitude of the midpoint
     */
    getLonMidpoint(l1, l2) {
        let mp, high, low;
        // if they are exactly the same, return either one
        if (l1 === l2) {
            return l1;
        }
        // figure out which has a higher/lower longitude
        high = l1 > l2 ? l1 : l2;
        low = l1 < l2 ? l1 : l2;
        if (high - low <= 180) {
            mp = (high + low) / 2;
        }
        else {
            mp = ((((low + 360) - high) / 2) + high) % 360;
        }
        return mp;
    }
    /**
     * Gets chart data from the online ephemeris
     * @param {string} date A UTC datetime string in ISO 8601 format
     * @param {Point}  p    An object with numeric lat and lng properties
     * @return {Promise<ChartData>}  A JSON object with the data needed to implement a chart
     */
    static getChartData(date, p) {
        return __awaiter(this, void 0, void 0, function* () {
            // path to ephemeris data       
            swisseph.swe_set_ephe_path(path.resolve(__dirname + '/swephm'));
            const flag = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH;
            let d = new Date(date);
            let minutes = d.getUTCMinutes() / 60;
            let planets = {};
            let julday_ut = swisseph.swe_julday(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours() + minutes, swisseph.SE_GREG_CAL);
            let swissephPlanet;
            for (var key in planetsEnums) {
                swissephPlanet = swisseph.swe_calc_ut(julday_ut, planetsEnums[key], flag);
                planets[key] = {
                    name: key,
                    lon: swissephPlanet.longitude,
                    lat: swissephPlanet.latitude,
                    spd: swissephPlanet.longitudeSpeed,
                    r: swissephPlanet.longitudeSpeed < 0 ? -1 : 1
                };
            }
            planets['north node'].lon = (planets['south node'].lon + 180) % 360;
            let extra = swisseph.swe_houses(julday_ut, p.lat, p.lng, 'P');
            let result = {
                planets: planets,
                houses: extra.house,
                ascendant: extra.ascendant,
                mc: extra.mc
            };
            return result;
        });
    }
    /**
     * Refresh or set the transits to a new time
     * @param {string} date (Optional) Target datetime for transits in ISO 8601 format; defaults to now()
     */
    refreshTransits(date = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ChartType.Synastry === this.type) {
                throw new Error("You cannot refresh transits on a synastry chart");
            }
            if (null === date) {
                date = new Date().toISOString();
            }
            let cdata = yield Chart.getChartData(date, this.p1.location);
            this._planets2 = this.getPlanets(cdata);
            this.calculateAspects();
        });
    }
    get houses() { return this._houses; }
    get aspects() { return this._aspects; }
    get ascendant() { return this._ascendant; }
    get innerPlanets() { return this._planets2 ? this._planets1 : []; }
    get outerPlanets() { return this._planets2 ? this._planets2 : this._planets1; }
}
exports.Chart = Chart;

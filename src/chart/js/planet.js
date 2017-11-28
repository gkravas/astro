"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * One of the planets, asteroids, the sun or moon
 */
class Planet {
    /**
     * Instantiate a new planet object.
     * @param {string} name The planet's name
     * @param {number} lon  The planet's longitude
     * @param {number} lat  The planet's latitude
     * @param {number} spd  The planet's speed relative to earth
     */
    constructor(name, lon, lat, spd) {
        /**
         * Dictionary of symbols for the planets for
         * use with the Kairon Semiserif font
         * @type {Object}
         */
        this.symbols = {
            "sun": "a",
            "moon": "s",
            "mercury": "d",
            "venus": "f",
            "earth": "g",
            "mars": "h",
            "jupiter": "j",
            "saturn": "k",
            "uranus": "ö",
            "neptune": "ä",
            "pluto": "#",
            "south node": "?",
            "north node": "ß",
            "ceres": "A",
            "pallas": "S",
            "juno": "D",
            "vesta": "F",
            "lilith": "ç",
            "cupido": "L",
            "chiron": "l",
            "nessus": "ò",
            "pholus": "ñ",
            "chariklo": "î",
            "eris": "È",
            "chaos": "Ê",
            "fortuna": "%"
        };
        this.name = name;
        this.longitude = lon;
        this.latitude = lat;
        this.speed = spd;
        this.symbol = this.symbols[name.toLowerCase()];
    }
    /**
     * A planet is retrograde when it's speed relative
     * to earth is less than zero
     * @return {boolean} Whether or not the planet is retrograde
     */
    isRetrograde() {
        return this.speed < 0;
    }
    /**
     * Is this one of the major planets typically included in a chart?
     * @return {boolean} Returns true if it is a major planet
     */
    isMajor() {
        return ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
            "uranus", "neptune", "pluto", "north node", "south node"]
            .indexOf(this.name.toLowerCase()) > -1;
    }
}
exports.Planet = Planet;

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
const rp_1 = require("./rp");
/**
 * Represents a person or event for whom a chart will be created
 */
class Person {
    /**
     * Creates a Person object
     * @param {string} public name Name of the person or event
     * @param {string} public date UTC date in ISO 8601 format, i.e. YYYY-MM-DDTHH:mmZ (caller must convert to UTC)
     * @param {Point} location The [lat: number, lon: number] of the event or person's birthplace
     */
    constructor(name, date, location) {
        this.name = name;
        this.date = date;
        this.location = location;
    }
    /**
     * Asynchronous factory function for creating people or events
     * @param  {string}          name     Name of the person or event
     * @param  {Date | string}   date     Exact datetime for the chart, preferably UTC date in ISO 8601 format, i.e. YYYY-MM-DDTHH:mmZ (caller must convert to UTC)
     * @param  {Point | string}  location Either an address or a lat/lng combination
     * @return {Promise<Person>}          The Person object that was created
     */
    static create(name, date, location) {
        return __awaiter(this, void 0, void 0, function* () {
            let dt, loc;
            // make sure a name was submitted
            if (!name) {
                throw new Error("No name was submitted for the person");
            }
            // deal with the type of date submitted
            if (typeof date === "string") {
                if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}\.\d{3})?Z/.test(date)) {
                    throw new TypeError("Date not formatted according to ISO 8601 (YYYY-MM-DDTHH:mmZ)");
                }
                dt = date;
            }
            else if (date instanceof Date) {
                dt = date.toISOString();
            }
            else {
                // defaults to "now"
                dt = new Date().toISOString();
            }
            // deal with the type of location submitted
            if (typeof location === "string") {
                loc = yield this.getLatLon(location);
            }
            else {
                // make sure latitude was valid
                if (location.lat < -90 || location.lat > 90) {
                    throw new RangeError("Latitude must be between -90 and 90");
                }
                // make sure longitude was valid
                if (location.lng < -180 || location.lng > 180) {
                    throw new RangeError("Longitude must be between -180 and 180");
                }
                loc = location;
            }
            return new Person(name, dt, loc);
        });
    }
    /**
     * Gets a timezone given a latitude and longitude
     * @param {Point} p  Contains the latitude and longitude in decimal format
     */
    static getTimezone(p) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield rp_1.default({
                uri: "https://maps.googleapis.com/maps/api/timezone/json",
                qs: {
                    key: this._key,
                    location: `${p.lat},${p.lng}`,
                    timestamp: Math.floor(Date.now() / 1000)
                }
            }).then((tzinfo) => tzinfo.rawOffset, (error) => { throw Error(error.errorMessage); });
        });
    }
    /**
     * Get a latitude and longitude given an address
     * @param {string} address The address of the desired lat/lon
     */
    static getLatLon(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield rp_1.default({
                uri: "https://maps.googleapis.com/maps/api/geocode/json",
                qs: {
                    key: this._key,
                    address: address
                }
            }).then((latlng) => {
                if (latlng.status === 'OK') {
                    return latlng.results[0].geometry.location;
                }
                else {
                    throw Error('No Results');
                }
            }, (error) => { throw Error(error.error_message); });
        });
    }
}
/**
 * Google API key
 * @type {string}
 */
Person._key = "AIzaSyAXnIdQxap1WQuzG0XxHfYlCA5O9GQyvuY";
exports.Person = Person;

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
const chart_1 = require("./chart");
/**
 * Usage: let chart: Chart = ChartFactory.create("my chart", person);
 */
class ChartFactory {
    static create(name, p1, p2 = null, type = chart_1.ChartType.Basic) {
        return __awaiter(this, void 0, void 0, function* () {
            // make sure a name was passed in
            if (null === name || "undefined" === typeof name || 0 === name.length) {
                throw Error("Chart must have a name (ChartFactory)");
            }
            // check for undefined people
            if (null === p1 || typeof p1 === "undefined") {
                throw Error("Person cannot be null or undefined (ChartFactory)");
            }
            switch (type) {
                case chart_1.ChartType.Synastry:
                case chart_1.ChartType.Combined:
                case chart_1.ChartType.CombinedTransits:
                case chart_1.ChartType.Davison:
                    if (null === p2) {
                        throw Error("2nd Person cannot be null for this chart type (ChartFactory)");
                    }
            }
            let cdata = [], date, p;
            switch (type) {
                case chart_1.ChartType.Transits:
                    cdata = yield Promise.all([
                        chart_1.Chart.getChartData(p1.date, p1.location),
                        chart_1.Chart.getChartData(new Date().toISOString(), p1.location)
                    ]);
                    return new chart_1.Chart(name, p1, cdata, null, type);
                case chart_1.ChartType.Synastry:
                case chart_1.ChartType.Combined:
                    cdata = yield Promise.all([
                        chart_1.Chart.getChartData(p1.date, p1.location),
                        chart_1.Chart.getChartData(p2.date, p2.location)
                    ]);
                    return new chart_1.Chart(name, p1, cdata, null, type);
                case chart_1.ChartType.CombinedTransits:
                    cdata = yield Promise.all([
                        chart_1.Chart.getChartData(p1.date, p1.location),
                        chart_1.Chart.getChartData(p2.date, p2.location),
                        chart_1.Chart.getChartData(new Date().toISOString(), p1.location)
                    ]);
                    return new chart_1.Chart(name, p1, cdata, null, type);
                case chart_1.ChartType.Davison:
                    date = ChartFactory.getDatetimeMidpoint(p1.date, p2.date);
                    p = ChartFactory.getGeoMidpoint(p1.location, p2.location);
                    cdata.push(yield chart_1.Chart.getChartData(date, p));
                    return new chart_1.Chart(name, p1, cdata);
                case chart_1.ChartType.DavisonTransits:
                    date = ChartFactory.getDatetimeMidpoint(p1.date, p2.date);
                    p = ChartFactory.getGeoMidpoint(p1.location, p2.location);
                    cdata = yield Promise.all([
                        chart_1.Chart.getChartData(date, p),
                        chart_1.Chart.getChartData(new Date().toISOString(), p)
                    ]);
                    return new chart_1.Chart(name, p1, cdata, null, type);
                default:
                    cdata.push(yield chart_1.Chart.getChartData(p1.date, p1.location));
                    return new chart_1.Chart(name, p1, cdata);
            }
        });
    }
    /**
     * Calculates the lat/lon of the geographic midpoint between two lat/lon pairs
     * @param  {Point} p1 Latitude/longitude of first location
     * @param  {Point} p2 Latitude/longitude of second location
     * @return {Point} The latitude/longitude of the geographic midpoint
     */
    static getGeoMidpoint(p1, p2) {
        let lat1 = ChartFactory.toRadians(p1.lat), lng1 = ChartFactory.toRadians(p1.lng), lat2 = ChartFactory.toRadians(p2.lat), lng2 = ChartFactory.toRadians(p2.lng), bx = Math.cos(lat2) * Math.cos(lng2 - lng1), by = Math.cos(lat2) * Math.sin(lng2 - lng1), lng3 = lng1 + Math.atan2(by, Math.cos(lat1) + bx), lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt(Math.pow(Math.cos(lat1) + bx, 2) + Math.pow(by, 2)));
        return {
            lat: ChartFactory.toDegrees(lat3),
            lng: ChartFactory.toDegrees(lng3)
        };
    }
    /**
     * Finds the exact midpoint between two dates
     * @param  {string} date1 The first date
     * @param  {string} date2 The second date
     * @return {string}       The midpoint date as an ISO 8601 string
     */
    static getDatetimeMidpoint(date1, date2) {
        let d1 = new Date(date1).getTime(), d2 = new Date(date2).getTime(), ts;
        // if two dates are the same, midpoint is just that date
        if (d1 === d2) {
            return date1;
        }
        ts = d1 < d2 ? d1 + ((d2 - d1) / 2) : d2 + ((d1 - d2) / 2);
        return new Date(ts).toISOString();
    }
}
/**
 * Converts decimal degrees to radians
 * @param  {number} degrees Decimal representation of degrees to be converted
 * @return {number}         Returns radians
 */
ChartFactory.toRadians = (degrees) => degrees * Math.PI / 180;
/**
 * Converts radians to decimal degrees
 * @param  {number} radians Radians to be converted
 * @return {number}         Returns decimal degrees
 */
ChartFactory.toDegrees = (radians) => radians * 180 / Math.PI;
exports.ChartFactory = ChartFactory;

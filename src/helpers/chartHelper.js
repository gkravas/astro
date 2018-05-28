'use strict';
const _ = require('lodash');
const array = require('lodash/array');
const astrology = require('../chart/js/astrology.js');
const Person = astrology.Person;
const ChartFactory = astrology.ChartFactory;
const moment = require('moment');
const validPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter'];
const validAspects = ['conjunct', 'semisextile', 'semisquare', 'sextile', 'quintile',
            'square', 'trine', 'sesquiquadrate', 'inconjunct', 'opposition'];
const signs = [ "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra",
                "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const validAspectsAngle = [0, 30, 45, 60, 72, 90, 120, 135, 150, 180];

module.exports = function(config) {

    function getNatalDateChart(date, coordinates) {
        console.log("date: " + date);
        console.log("coordinates: " + JSON.stringify(coordinates));
        return Person.create("natal date", date, dbPointToLatLng(coordinates))
            .then(person => ChartFactory.create("natal date chart", person))
            .then(chartData => parseNatalDateChartData(chartData));
    }

    function getDailyPrediction(natalDate, dailyPrediction) {
        return Person.create("natal date", natalDate.date, dbPointToLatLng(natalDate.coordinates))
            .then(person => {
                var promises = [];
                var hour;
                for(var i = 0; i < 24; i+=3) {
                    hour = ("0" + i).slice(-2);
                    promises.push(Person.create("transits day", new moment(dailyPrediction.date + `  ${hour}:00:00 +0000`, 'YYYY-MM-DD HH:mm:ss Z').toISOString(), dbPointToLatLng(dailyPrediction.coordinates))
                        .then(dayPersonSimulation => {
                            return ChartFactory.create("transits", person, dayPersonSimulation, astrology.ChartType.Combined);
                        }));
                }
                return Promise.all(promises);
            })
            .then(chartData => parseChartDate(chartData));
    }

    function dbPointToLatLng(point) {
        return {
            lat: point.coordinates[0],
            lng: point.coordinates[1]
        }
    }

    function strtime(value) {
        var hour = Math.floor (value);
        var minFrac = (value - hour) * 60;
        var min = Math.floor (minFrac);
        var sec = Math.floor ((minFrac - min) * 60);
        
        return hour + "° " + min + "' " + sec + '"';
    };

    function getHouse(houses, longitude) {
        let length = houses.length;
        for (var i = 0; i < length; i++) {
            var start = houses[i].start;
            var end = houses[i].end;
            var d = Math.abs(end - start);
            
            if ((longitude >= start && longitude < start + d) ||
                (longitude >= end - d && longitude < end)) {
                return houses[i].index;
            }
        }
        return -1;
    };

    function parseHouses(houses) {
        var result = [];
        for (var i = 0; i < houses.length - 1; i++) {
            result.push({
                start: houses[i],
                end: houses[i + 1],
                index: i + 1,
                sign: signs[Math.floor (houses[i] / 30)]
            });
        }
        result.push({
            start: houses[houses.length - 1],
            end: houses[0],
            index: houses.length,
            sign: signs[Math.floor (houses[houses.length - 1] / 30)]
        });
        return result;
    };

    function parseNatalDateChartData(chartData) {
        let houses = parseHouses(chartData.houses);
        return {
            planets: chartData._planets1
                .filter(planet => {
                    return planet.longitude;
                })
                .flatMap(planet => {
                    var lang = planet.longitude;
                    var house = Math.floor (lang / 30);
                    var lang30 = lang - house * 30;

                    return {
                        name: planet.name,
                        longitude: planet.longitude,
                        latitude: planet.latitude,
                        speed: planet.speed,
                        angle: lang30,
                        sign: signs[house],
                        time: strtime(lang30),
                        retrogate: planet.speed < 0,
                        house: getHouse(houses, planet.longitude)
                    }
                }),
            houses: houses.sort((a, b) => {
                return a.index - b.index
            }),
            aspects: chartData.aspects.flatMap(aspect => {
                    return {
                        planet1: aspect.p1.name,
                        planet2: aspect.p2.name,
                        angle: validAspectsAngle[validAspects.indexOf(aspect.type)]
                    };
                }).filter((aspect) => {
                    return aspect.angle || aspect.angle === 0;
                }),
        }
    }

    function parseChartDate(arr) {
        const aspects = arr
            .flatMap(chartData => {
                return chartData.aspects;
            })
            .filter(function(aspect) {
                return validPlanets.includes(aspect.p1.name) 
                    && validPlanets.includes(aspect.p2.name)
                    && validAspects.includes(aspect.type)
                    && aspect.isApplying();
            })
            .map(function(aspect) {
                return {
                    natalPlanet: aspect.p1.name,
                    dayPlanet: aspect.p2.name,
                    angle: validAspectsAngle[validAspects.indexOf(aspect.type)]
                };
            });
        
        return Promise.resolve({
                aspects: _.uniqWith(aspects, _.isEqual)
            })
    }

    return {
        getNatalDateChart: getNatalDateChart,
        getDailyPrediction: getDailyPrediction
    }
}
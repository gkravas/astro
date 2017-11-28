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

const validAspectsAngle = [0, 30, 45, 60, 72, 90, 120, 135, 150, 180];

module.exports = function(config) {

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
        getDailyPrediction: getDailyPrediction
    }
}
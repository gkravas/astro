'use strict';
const astrology = require('../chart/js/astrology.js');
const Person = astrology.Person;
const ChartFactory = astrology.ChartFactory;
const moment = require('moment');
const validPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter'];
const validAspects = ['conjunct', 'semisextile', 'semisquare', 'sextile',
            'square', 'trine', 'sesquiquadrate', 'inconjunct', 'opposition'];

const validAspectsAngle = [0, 30, 45, 60, 90, 120, 135, 150, 180];

module.exports = function(config) {

    function getDailyPrediction(natalDate, dailyPrediction) {
        return Person.create("natal date", natalDate.date, dbPointToLatLng(natalDate.coordinates))
            .then(person => {
                return Person.create("transits day", dailyPrediction.date, dbPointToLatLng(dailyPrediction.coordinates))
                    .then(dayPersonSimulation => {
                        return ChartFactory.create("transits", person, dayPersonSimulation, astrology.ChartType.Transits);
                    });
            })
            .then(chartData => parseChartDate(chartData));
    }

    function dbPointToLatLng(point) {
        return {
            lat: point.coordinates[0],
            lng: point.coordinates[1]
        }
    }

    function parseChartDate(chartData) {
        const aspects = chartData.aspects
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
                aspects: aspects
            })
    }

    return {
        getDailyPrediction: getDailyPrediction
    }
}
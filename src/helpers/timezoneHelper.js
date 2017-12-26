'use strict';
const Person = require("../chart/js/person").Person
const Sequelize = require('sequelize');
import {ExternalServiceError} from '../errors/externalServiceError';
module.exports = function(config, logger){
    function getTimezone(city) {
        return Person.getLatLon(city)
            .then(function(coordinates) {
                return Person.getTimezone(coordinates)
                    .then(function(timezone) {
                        return Promise.resolve({
                            timezoneMinutesDifference: timezone,
                            coordinates: [coordinates.lat, coordinates.lng]
                        });
                    });
            })
            .catch(function(error) {
                console.error(error);
                logger.log({
                    level: 'error',
                    message: error
                });
                throw new ExternalServiceError("timezone error", "timezone not found");
            });
    }
    return {
        getTimezone: getTimezone
    }
}
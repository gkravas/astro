'use strict';
const Person = require("../chart/js/person").Person
const Sequelize = require('sequelize');
import {ExternalServiceError} from '../errors/externalServiceError';
module.exports = function(config){
    function getTimezone(city) {
        return Person.getLatLon(city)
            .then(function(coordinates) {
                return Person.getTimezone(coordinates)
                    .then(function(timezone) {
                        if (!timezone) {
                            throw new ExternalServiceError("timezone error", "timezone not found");
                        }

                        return Promise.resolve({
                            timezoneMinutesDifference: timezone,
                            coordinates: [coordinates.lat, coordinates.lng]
                        });
                    });
            })
            .catch(function(error) {
                throw new ExternalServiceError("timezone error", "timezone not found");
            });
    }
    return {
        getTimezone: getTimezone
    }
}
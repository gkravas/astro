'use strict';
const Person = require("../chart/js/person").Person
const Sequelize = require('sequelize');
const ExternalServiceError = require('../errors/ExternalServiceError.js');
module.exports = function(config){
    function getTimezone(city) {
        return Person.getLatLon(city)
            .then(function(location) {
                return Person.getTimezone(location);
            })
            .then(function(timezone) {
                if (!timezone) {
                    throw new ExternalServiceError("timezone error", "timezone not found");
                }
                return timezone;
            })
            .catch(function(error) {
                throw new ExternalServiceError("timezone error", "timezone not found");
            });
    }
    return {
        getTimezone: getTimezone
    }
}
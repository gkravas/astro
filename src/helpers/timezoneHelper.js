'use strict';
const Person = require("../chart/js/person").Person
import {ExternalServiceError} from '../errors/externalServiceError';
module.exports = function(models, logger){

    function getLocationByGoogle(city) {
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
    }

    function getTimezone(location) {
        return models.Location.findOne({
                where: {
                    name: location
                }
            })
            .then((cachedLocation) => {
                if (!cachedLocation) {
                    return getLocationByGoogle(location)
                        .then((googleLocation) => {
                            console.log(googleLocation);
                            return models.Location.create({
                                name: location,
                                coordinates: { type: 'Point', coordinates: googleLocation.coordinates},
                                timezoneMinutesDifference: googleLocation.timezoneMinutesDifference
                            });
                        });
                } else {
                    return {
                        name: cachedLocation.name,
                        coordinates: cachedLocation.coordinates,
                        timezoneMinutesDifference: cachedLocation.timezoneMinutesDifference
                    };
                }
            })
            .catch(function(error) {
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
'use strict';
module.exports = function(config, app, models) {
    const express = require('express');
    const router = express.Router();
    const InternalError = require('../errors/InternalError.js');

    router.get('/natalDate', function(req, res) {
        const userId = req.user.id;

        findNatalDates(userId)
            .then(function(natalDates) {
                res.status(201).json(natalDates.map(formatModel));
            })
            .catch(function(err) {
                console.error(err)
                res.status(400).send({ 
                    errors: [new InternalError("API error", "Natal dates not found")]
                });
            });
    });

    function findNatalDates(userId) {
        return models.NatalDate.findAll({
            where: {
                userId: userId
            }
        });
    }

    function formatModel(natalDate) {
        return {
            id: natalDate.id,
            name: natalDate.name,
            date: natalDate.date,
            location: natalDate.location,
            coordinates: {
                lat: natalDate.coordinates.coordinates[0],
                lng: natalDate.coordinates.coordinates[1],
            },
            timezoneMinutesDifference: natalDate.timezoneMinutesDifference,
            type: natalDate.type,
            primary: natalDate.primary,
        }
    }

    return router;
}
'use strict';
module.exports = function(config, app, models) {
    const moment = require('moment');
    const express = require('express');
    const router = express.Router();
    const chartHelper = require('../helpers/chartHelper')(config);
    const InternalError = require('../errors/InternalError.js');

    router.get('/natalDate/:natalDateId/dailyPrediction', function(req, res) {
        const natalDateId = req.params.natalDateId;
        const dateString = req.query.date;
        const date = moment(dateString, 'DDMMYYYY');
        const userId = req.user.id;

        findNatalDate(userId, natalDateId)
            .then(function(natalDate) {
                return findDailyPrediction(userId, natalDateId, date)
                    .then(function(dailyPrediction) {
                        if (dailyPrediction) {
                            return Promise.resolve(dailyPrediction);
                        } else {
                            return createDailyPrediction(userId, natalDate, date);
                        }
                    })
                    .then(function(dailyPrediction) {
                        return increaseDailyPredictionViews(dailyPrediction);
                    })
                    .then(function(dailyPrediction) {
                        return chartHelper.getDailyPrediction(natalDate, dailyPrediction);
                    })
                    .then(function(chartData) {
                        return generateExplanation(chartData.aspects);
                    })
                    .then(function(explanation) {
                        res.status(201).json({
                            explanation: explanation
                        });
                    });
            })
            .catch(function(err) {
                res.status(400).send({ 
                    errors: [new InternalError("API error", "Day cannot be predicted")]
                });
            });
    });

    function findDailyPrediction(userId, natalDateId, date) {
        return models.DailyPrediction.find({
            where: {
                userId: userId,
                natalDateId: natalDateId,
                date: date
            }
        });
    }

    function findNatalDate(userId, natalDateId) {
        return models.NatalDate.findOne({
            where: {
                userId: userId,
                id: natalDateId,
            }
        })
    }

    function createDailyPrediction(userId, natalDate, date) {
        return models.DailyPrediction.create({
            userId: userId,
            natalDateId: natalDate.id,
            date: date,
            coordinates: natalDate.coordinates,
            timezoneMinutesDifference: natalDate.timezoneMinutesDifference
        });
    }

    function increaseDailyPredictionViews(dailyPrediction) {
        dailyPrediction.views += 1;
        return dailyPrediction.save();
    }

    function generateExplanation(aspects) {
        return Promise.all(aspects.map(function(aspect) {
            return models.DailyPlanetAspectExplanation.findOne({
                where: {
                    natalPlanet: aspect.natalPlanet,
                    dayPlanet: aspect.dayPlanet,
                    aspect: aspect.angle
                }
            })
        }))
        .then(function(explanations) {
            explanations = explanations.filter(function(explanation) {
                return explanation;
            });
            return Promise.resolve(explanations.map(function(explanation) {
                return explanation.lemma;
            }).join('. '));
        });
    }

    return router;
};
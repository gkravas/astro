import moment from 'moment';

export class DailyPredictionService {

    constructor(models, config, logger) {
        this.models = models;
        this.chartHelper = require('../helpers/chartHelper')(config);
    }

    getDailyPrediction(userId, natalDateId, date) {
        const that = this;
        date = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
        return that.findNatalDate(userId, natalDateId)
            .then(function(natalDate) {
                return that.findDailyPrediction(userId, natalDateId, date)
                    .then(function(dailyPrediction) {
                        if (dailyPrediction) {
                            return Promise.resolve(dailyPrediction);
                        } else {
                            return that.createDailyPrediction(userId, natalDate, date);
                        }
                    })
                    .then(function(dailyPrediction) {
                        return that.increaseDailyPredictionViews(dailyPrediction);
                    });
            });
    }

    getDailyPredictionExplanations(dailyPrediction) {
        const that = this;
        return dailyPrediction.getNatalDate()
            .then(function(natalDate) {
                return that.chartHelper.getDailyPrediction(natalDate, dailyPrediction)
            })
            .then(function(chartData) {
                return that.generateExplanation(chartData.aspects);
            });
    }

    rateDailyPrediction(userId, natalDateId, date, accuracy) {
        const that = this;
        return that.findDailyPrediction(userId, natalDateId, date)
            .then(function(dailyPrediction) {
                return that.setDailyPredictionAccuracy(dailyPrediction, accuracy);
            });
    }

    setDailyPredictionAccuracy(dailyPrediction, accuracy) {
        dailyPrediction.accuracy = accuracy;
        return dailyPrediction.save();
    }

    findDailyPrediction(userId, natalDateId, date) {
        return this.models.DailyPrediction.find({
            where: {
                userId: userId,
                natalDateId: natalDateId,
                date: date
            }
        });
    }

    findNatalDate(userId, natalDateId) {
        return this.models.NatalDate.findOne({
            where: {
                userId: userId,
                id: natalDateId
            }
        })
    }

    createDailyPrediction(userId, natalDate, date) {
        return this.models.DailyPrediction.create({
            userId: userId,
            natalDateId: natalDate.id,
            date: date,
            coordinates: natalDate.coordinates,
            timezoneMinutesDifference: natalDate.timezoneMinutesDifference
        });
    }

    increaseDailyPredictionViews(dailyPrediction) {
        dailyPrediction.views += 1;
        return dailyPrediction.save();
    }

    generateExplanation(aspects) {
        const that = this;
        return Promise.all(aspects.map(function(aspect) {
            return that.models.DailyPlanetAspectExplanation.findOne({
                where: {
                    natalPlanet: aspect.natalPlanet,
                    dayPlanet: aspect.dayPlanet,
                    aspect: aspect.angle
                }
            })
        }))
        .then(function(explanations) {
            return Promise.resolve(explanations.filter(function(explanation) {
                return explanation;
            }));
        });
    }
}
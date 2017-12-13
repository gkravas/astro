import moment from 'moment';

export class DailyPredictionService {

    constructor(config, models, logger) {
        this.models = models;
        this.chartHelper = require('../helpers/chartHelper')(config);
    }

    getDailyPrediction(user, natalDateId, date) {
        const userId = user.id;
        const that = this;
        date = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
        return that.findNatalDate(userId, natalDateId)
            .then(function(natalDate) {
                return that.findDailyPrediction(userId, user.location, natalDateId, date)
                    .then(function(dailyPrediction) {
                        if (dailyPrediction) {
                            return Promise.resolve(dailyPrediction);
                        } else {
                            return that.createDailyPrediction(user, natalDate, date);
                        }
                    })
                    .then(function(dailyPrediction) {
                        console.log(dailyPrediction);
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

    rateDailyPrediction(user, natalDateId, date, accuracy) {
        const that = this;
        return that.findDailyPrediction(user.id, user.location, natalDateId, date)
            .then(function(dailyPrediction) {
                return that.setDailyPredictionAccuracy(dailyPrediction, accuracy);
            });
    }

    setDailyPredictionAccuracy(dailyPrediction, accuracy) {
        return dailyPrediction.update({
            accuracy: accuracy
        });
    }

    findDailyPrediction(userId, location, natalDateId, date) {
        return this.models.DailyPrediction.findOne({
            where: {
                userId: userId,
                natalDateId: natalDateId,
                date: date,
                location: location
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

    createDailyPrediction(user, natalDate, date) {
        return this.models.DailyPrediction.create({
            userId: user.id,
            natalDateId: natalDate.id,
            date: date,
            location: user.location,
            coordinates: user.coordinates,
            timezoneMinutesDifference: user.timezoneMinutesDifference
        });
    }

    increaseDailyPredictionViews(dailyPrediction) {
        return dailyPrediction.increment('views'); 
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
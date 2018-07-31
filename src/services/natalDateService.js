import moment from 'moment';
import ServiceError from '../errors/serviceError'
import { Utils } from '../utils';

export class NatalDateService {

    constructor(config, models, logger) {
        this.models = models;
        this.timezoneHelper = require('../helpers/timezoneHelper')(models, logger);
        this.chartHelper = require('../helpers/chartHelper')(config);
    }

    getChart(natalDate) {
        return this.chartHelper.getNatalDateChart(natalDate.date, natalDate.coordinates);
    }

    get(user, id) {
        const that = this;
        if (id) {
            return that.models.NatalDate.findOne({
                where: {
                    id: id,
                    userId: user.id
                }
            }).then(natalDate => {
                return [natalDate];
            });
        } else {
            return that.models.NatalDate.findAll({
                where: {
                    userId: user.id
                }
            })
            .each((natalDate) => {
                if (natalDate.chart) {
                    return natalDate;
                }
                return that.getChart(natalDate)
                    .then((chart) => {
                        natalDate.chart = chart;
                        return natalDate.save();
                    });
            });
        }
    }

    create(user, name, date, location, type, primary) {
        const that = this;
        return that.timezoneHelper.getTimezone(location)
            .then(function(args) {
                var validatedDate = moment(date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DDTHH:mm:ss');
                if (date !== validatedDate) {
                    throw new ServiceError('format violation', "Wrong date format should be 'YYYY-MM-DD HH:mm:ss'", 'birthDate');
                }
                const timezoneOffset = Utils.formatTimeZoneOffset(args.timezoneMinutesDifference);
                validatedDate = moment.parseZone(date + timezoneOffset, "YYYY-MM-DDTHH:mm:ssZ", true).format();
                
                var model = {
                    userId: user.id,
                    name: name,
                    date: validatedDate,
                    location: args.name,
                    coordinates: args.coordinates,
                    timezoneMinutesDifference: args.timezoneMinutesDifference,
                    primary: primary,
                    type: type
                };

                return that.models.NatalDate.create(model)
                    .then((natalDate) => {
                        return that.getChart(natalDate)
                            .then((chart) => {
                                natalDate.chart = chart;
                                return natalDate.save();
                            });
                    })
                console.log(model);
            });
    }

    update(id, userId, name, date, location, type, primary) {
        const that = this;
        return that.timezoneHelper.getTimezone(location)
            .then(function(args) {
                var validatedDate = moment(date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DDTHH:mm:ss');
                if (date !== validatedDate) {
                    throw new ServiceError('format violation', "Wrong date format should be 'YYYY-MM-DD HH:mm:ss'", 'birthDate');
                }
                const timezoneOffset = Utils.formatTimeZoneOffset(args.timezoneMinutesDifference);
                validatedDate = moment.parseZone(date + timezoneOffset);

                console.log(args);
                var model = {
                    id: id,
                    userId: userId,
                    name: name,
                    date: validatedDate,
                    location: args.name,
                    coordinates: args.coordinates,
                    timezoneMinutesDifference: args.timezoneMinutesDifference,
                    primary: primary,
                    type: type
                };

                return that.models.NatalDate.findOne({
                        where: {
                            id: id,
                            userId: userId
                        },
                        defaults: model     
                    })
                    .then((natalDate) => {
                        if (model.name) {
                            natalDate.name = name;
                        }
                        if (model.date) {
                            natalDate.date = model.date;
                        }
                        if (model.location) {
                            natalDate.location = model.location;
                            natalDate.coordinates = model.coordinates;
                            natalDate.timezoneMinutesDifference = model.timezoneMinutesDifference;
                        }
                        if (model.primary) {
                            natalDate.primary = model.primary;
                        }
                        if (model.type) {
                            natalDate.type = model.type;
                        }
                        return that.getChart(natalDate)
                            .then((chart) => {
                                natalDate.chart = chart;
                                return natalDate.save();
                            });
                    })
            });
    }
}
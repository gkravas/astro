import moment from 'moment';
import ServiceError from '../errors/serviceError'
export class NatalDateService {

    constructor(config, models, logger) {
        this.models = models;
        this.timezoneHelper = require('../helpers/timezoneHelper')(config, logger);
    }

    create(user, name, date, location, type, primary) {
        const that = this;
        return that.timezoneHelper.getTimezone(location)
            .then(function(location) {
                return {
                    location: location
                }
            })
            .then(function(args) {
                const validatedDate = moment(date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                if (date !== validatedDate) {
                    throw new ServiceError('format violation', "Wrong date format should be 'YYYY-MM-DD HH:mm:ss'", 'birthDate');
                }
                
                var model = {
                    userId: user.id,
                    name: name,
                    date: validatedDate,
                    location: location,
                    coordinates: { type: 'Point', coordinates: args.location.coordinates},
                    timezoneMinutesDifference: args.location.timezoneMinutesDifference,
                    primary: primary,
                    type: type
                };

                return that.models.NatalDate.create(model);
            });
    }

    update(id, userId, name, date, location, type, primary) {
        const that = this;
        return that.timezoneHelper.getTimezone(location)
            .then(function(location) {
                return {
                    location: location
                }
            })
            .then(function(args) {
                const validatedDate = moment(date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                if (date !== validatedDate) {
                    throw new ServiceError('format violation', "Wrong date format should be 'YYYY-MM-DD HH:mm:ss'", 'birthDate');
                }
                
                var model = {
                    id: id,
                    userId: userId,
                    name: name,
                    date: validatedDate,
                    location: location,
                    coordinates: { type: 'Point', coordinates: args.location.coordinates},
                    timezoneMinutesDifference: args.location.timezoneMinutesDifference,
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
                        return natalDate.save();
                    });
            });
    }
}
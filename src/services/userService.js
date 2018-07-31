import moment from 'moment';
import ServiceError from '../errors/serviceError'
export class UserService {

    constructor(config, models, logger) {
        this.models = models;
        this.timezoneHelper = require('../helpers/timezoneHelper')(models, logger);
    }

    get(userId) {
        return this.models.User.findOne({
            where: {
                id: userId
            }
        });
    }

    update(userId, email, location) {
        if (!email && !location) {
            return;
        }
        const that = this;
        return this.models.User.findOne({
                where: {
                    id: userId
                }
            })
            .then(user => {
                if (email) {
                    user.email = email;
                }
                if (location) {
                    return that.timezoneHelper.getTimezone(location)
                        .then(function(loc) {
                            user.location = loc.name;
                            user.coordinates = loc.coordinates;
                            user.timezoneMinutesDifference = loc.timezoneMinutesDifference; 
                            return user;
                        });
                } else {
                    return user;
                }
            })
            .then(user => {
                return user.save();
            })
    }
}
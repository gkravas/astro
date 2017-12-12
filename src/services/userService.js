import moment from 'moment';
import ServiceError from '../errors/serviceError'
export class UserService {

    constructor(config, models, logger) {
        this.models = models;
        this.timezoneHelper = require('../helpers/timezoneHelper')(config, logger);
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
                        .then(function(googleLocation) {
                            user.location = location;
                            user.coordinates = { type: 'Point', coordinates: googleLocation.coordinates};
                            user.timezoneMinutesDifference = googleLocation.timezoneMinutesDifference; 
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
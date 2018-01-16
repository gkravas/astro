'use strict';

import { Utils } from './utils';
module.exports = function(config) {
    const Sequelize = require('sequelize');
    const bcrypt = require('bcrypt');
    const dbConfig = config.db;

    const sql = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        dialectOptions: {
            timezone: '+00:00'
        },
        timezone: '+00:00'
    });

    const User = sql.define('user', {
        id: { 
            type: Sequelize.BIGINT,
            primaryKey: true,
            allowNull: false,
            defaultValue: 0
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            },
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            notEmpty: true
        },
        fbId: { 
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        fbToken: { 
            type: Sequelize.STRING,
            allowNull: true,
        },
        location: {
            type: Sequelize.STRING,
            allowNull: true
        },
        coordinates: {
            type: Sequelize.GEOMETRY('POINT'),
            allowNull: true
        },
        timezoneMinutesDifference: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
    }, {
        version: true,
        paranoid: true,
        timestamps: true,
        hooks: {
            beforeValidate: function(user, options) {
                if (!user.password && user.fbId && user.fbToken) {
                    user.password = Utils.randomString(20, 'aA#');
                }
            },
            beforeCreate: function(user, options) {
                user.password = user.generateHash(user.password);
                user.email = user.email.toLowerCase()
                return User.max('id')
                    .then(max => {
                        user.id = (Number.isNaN(max) ? 1 : max + 1);
                    });
            },
            beforeUpdate: function(user, options) {
                if (user.changed('password')) {
                    user.password = user.generateHash(user.password);
                }
                if (user.changed('email')) {
                    user.email = user.email.toLowerCase()
                }
            },
        }
    });

    User.prototype.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    };
    User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };
    User.prototype.toJSON = function() {
        return {
            id: this.id,
            email: this.email
        }
    };

    const NatalDate = sql.define('natalDate', {
        id: { 
            type: Sequelize.BIGINT, 
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex'
        },
        userId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex'
        },
        name: { 
            type: Sequelize.STRING, 
            allowNull: false,
        },
        date: { 
            type: Sequelize.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },
        location: {
            type: Sequelize.STRING,
            allowNull: false
        },
        coordinates: {
            type: Sequelize.GEOMETRY('POINT'),
            allowNull: false
        },
        timezoneMinutesDifference: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        type: {
            type:   Sequelize.ENUM,
            values: ['male', 'female', 'freeSpirit', 'unknown'],
            defaultValue: 'unknown',
            validate: {
                isIn: [['male', 'female', 'freeSpirit', 'unknown']],
            }
        },
        primary: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        version: true,
        paranoid: true,
        timestamps: true,
        hooks: {
            beforeValidate: function(natalDate, options) {
                if (!natalDate.id) {
                    return NatalDate.max('id', { where: { userId: natalDate.userId } })
                        .then(max => {
                            natalDate.id = (Number.isNaN(max) ? 1 : max + 1);
                        });
                }
            },
        }
    });

    User.NatalDates = User.hasMany(NatalDate, {foreignKey: 'userId', sourceKey: 'id'});
    NatalDate.User = NatalDate.belongsTo(User, {foreignKey: 'userId', targetKey: 'id'});

    const DailyPlanetAspectExplanation = sql.define('dailyPlanetAspectExplanation', {
        variation: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: 'compositeIndex'
        },
        natalPlanet: {
            type:   Sequelize.ENUM,
            values: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter'],
            allowNull: false,
            unique: 'compositeIndex'
        },
        dayPlanet: {
            type:   Sequelize.ENUM,
            values: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter'],
            allowNull: false,
            unique: 'compositeIndex'
        },
        aspect: {
            type:   Sequelize.INTEGER,
            values: [0, 30, 45, 60, 72, 90, 120, 135, 150, 180],
            allowNull: false,
            unique: 'compositeIndex',
            validate: {
                isIn: [[0, 30, 45, 60, 72, 90, 120, 135, 150, 180]],
            }
        },
        title: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        lemma: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    }, {
        version: true,
        paranoid: true,
        timestamps: true
    });

    const DailyPrediction = sql.define('dailyPrediction', {
        userId: { 
            type: Sequelize.BIGINT, 
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex'
        },
        natalDateId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex',
        },
        date: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex',
        },
        location: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex'
        },
        coordinates: {
            type: Sequelize.GEOMETRY('POINT'),
            allowNull: false
        },
        timezoneMinutesDifference: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        views: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        accuracy: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 100 }
        }
    }, {
        version: true,
        paranoid: true,
        timestamps: true
    });

    NatalDate.hasMany(DailyPrediction, {foreignKey: 'natalDateId', sourceKey: 'id'});
    DailyPrediction.NatalDate = DailyPrediction.belongsTo(NatalDate, {foreignKey: 'natalDateId', targetKey: 'id'});

    const Audit = sql.define('audit', {
        id: { 
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        userAgent: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        method: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        request: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        response: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        jwt: {
            type: Sequelize.TEXT,
            allowNull: false,
        }
    }, {
        version: false,
        paranoid: false,
        timestamps: false
    });

    const UserMisc = sql.define('userMisc', {
        userId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        lastSeen: {
            type: Sequelize.DATE,
            allowNull: false,
        }
    }, {
        version: true,
        paranoid: true,
        timestamps: true
    });
    return {
        sequelize: sql,
        User: User,
        NatalDate: NatalDate,
        DailyPlanetAspectExplanation: DailyPlanetAspectExplanation,
        DailyPrediction: DailyPrediction,
        Audit: Audit,
        UserMisc: UserMisc
    }
}
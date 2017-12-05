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
        }
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
            allowNull:false,
            unique: true
        },
        password: {
            type: Sequelize.STRING,
            validate: {
                min: 6
            },
            allowNull:false
        },
        fbId: { 
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        fbToken: { 
            type: Sequelize.STRING,
            allowNull: true,
        },
        accountComplete: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        version: true,
        paranoid: true,
        timestamps: true,
        hooks: {
            beforeValidate: function(user, options) {
                if (!user.password && user.fbId && user.fbToken) {
                    user.password = Utils.randomString(10, 'aA#!');
                }
            },
            beforeCreate: function(user, options) {
                user.password = user.generateHash(user.password);
                return User.max('id')
                    .then(max => {
                        user.id = (Number.isNaN(max) ? 1 : max + 1);
                    });
            },
            beforeUpdate: function(user, options) {
                if (user.changed('password')) {
                    user.password = user.generateHash(user.password);
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
            beforeCreate: function(natalDate, options) {
                return NatalDate.max('id', { where: { userId: natalDate.userId } })
                .then(max => {
                    natalDate.id = (Number.isNaN(max) ? 1 : max + 1);
                })
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

    return {
        sequelize: sql,
        User: User,
        NatalDate: NatalDate,
        DailyPlanetAspectExplanation: DailyPlanetAspectExplanation,
        DailyPrediction: DailyPrediction,
    }
}
'use strict';
module.exports = function(config, app, models){
    const express = require('express');
    const passport = require('passport');
    const jwt = require('jsonwebtoken');
    const LocalStrategy = require('passport-local').Strategy;
    const timezoneHelper = require('../helpers/timezoneHelper')();
    const ExternalServiceError = require('../errors/ExternalServiceError.js');

    const router = express.Router();

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password'
    },
    function(username, password, done) {
        models.User.findOne({
            where: {
                email: username
            }
        })
        .then(function(user) {
            if(!user || !user.validPassword(password)) {
                done(null, false, {message: 'Invalid username or password'});
            } else {
                done(null, user);
            }
        })
        .catch(function(err) {
            done(err);
        });
    }))

    function generateToken(req, res, next) {
        req.token = jwt.sign({
            id: req.user.id
        }, config.jwt.secret, {
            expiresIn: config.jwt.tokenExpiration
        });
        next();
    }
    
    function respond(req, res) { 
        res.status(200).json({
          user: req.user.toJSON(),
          token: req.token
        });
    }
    
    router.post('/login', passport.authenticate(  
        'local', {
          session: false
        }), generateToken, respond);
    
    router.post('/register', function(req, res) {
        models.sequelize.transaction(function (t) {
            return models.User.create({
                email: req.body.email,
                password: req.body.password,
            }, {transaction: t})
                .then(function(user) {
                    return timezoneHelper.getTimezone(req.body.birthLocation)
                        .then(function(timezoneMinutesDifference) {
                            return {
                                user: user,
                                timezoneMinutesDifference: timezoneMinutesDifference,
                            }
                        });
                })
                .then(function(args) {
                    var model = {
                        id: 0,
                        name: 'me',
                        userId: args.user.id,
                        date: req.body.birthDate,
                        location: req.body.birthLocation,
                        timezoneMinutesDifference: args.timezoneMinutesDifference,
                        primary: true
                    };
                    if (req.body.type) {
                        model.type = req.body.type;
                    }

                    return models.NatalDate.create(model, {transaction: t})
                        .then(function(natalDate) {
                            args.user.addNatalDate(natalDate);
                        });
                });
        })
        .then(function(natalDate) {
            res.status(201).json({});
        })
        .catch(function(err) {
            if (err instanceof ExternalServiceError) {
                res.status(400).send({ errors: [err] });
                
            } else {
                res.status(400).send({ errors: err.errors});
            }
        });
    });

    return router;
}
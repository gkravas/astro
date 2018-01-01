'use strict';
import util from 'util';
import moment from 'moment';
import {Facebook, FacebookApiException} from 'fb';

module.exports = function(config, app, models, emailService, authenticate, logger){
    const express = require('express');
    const passport = require('passport');
    const jwt = require('jsonwebtoken');
    const LocalStrategy = require('passport-local').Strategy;
    const timezoneHelper = require('../helpers/timezoneHelper')(config, logger);
    const ExternalServiceError = require('../errors/externalServiceError.js').ExternalServiceError;
    const ServiceError = require('../errors/serviceError.js').ServiceError;
    const Sequelize = require('sequelize');
    const FB = new Facebook(config.fb);
    const jsesc = require('jsesc');
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
                email: username.toLocaleLowerCase()
            }
        })
        .then(function(user) {
            if(!user || !user.validPassword(jsesc(password, { 'escapeEverything': true }))) {
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
            id: req.user.id,
            apps: {
                android: config.apps.android,
                iOS: config.apps.iOS,
            }
        }, config.jwt.secret, {
            expiresIn: config.jwt.tokenExpiration
        });
        next();
    }
    
    function respond(req, res) { 
        res.status(200).json({
            user: req.user.toJSON(),
            apps: {
                android: config.apps.android,
                iOS: config.apps.iOS,
            },
            token: req.token
        });
    }

    function getFBMe(fbToken) {
        return new Promise(function (fulfill, reject){
            FB.setAccessToken(fbToken);
            FB.api('/me', 'get', { fields: 'id, email' }, function (res) {
                if(!res || res.error) {
                    reject(res.error);
                }
                fulfill(res);
            });
        });
    }

    function fbLogin(req, res, next) { 
        FB.setAccessToken(req.body.fbToken);
        return getFBMe(req.body.fbToken)
            .then(function(fbRes) {
                return models.User.findOne({
                    where: {
                        $or: [
                            { fbId: { $eq: fbRes.id } }, { email: { $eq: fbRes.email } }
                        ]
                    }
                })
                .then((user) => {
                    if (user) {
                        if (!user.email && !fbRes.email) {
                            user.email = fbRes.email;    
                        }
                        user.fbId = fbRes.id;
                        user.fbToken = req.body.fbToken;
                        return user.save();
                    }
                    return models.User.create({
                        email: fbRes.email ? fbRes.email : fbRes.id + '@facebook.com',
                        fbId: fbRes.id,
                        fbToken: req.body.fbToken,
                    });
                });
            })
            .then((user) => {
                req.user = user;
                next();
            })
            .catch(function(err) {
                handleError(res, err);
            });
    }
    
    router.post('/resetPassword', authenticate, function(req, res) {
        models.User.findOne({
            where: {
                id: req.user.id
            }
        })
        .then((user) => {
            user.password = jsesc(req.body.password, { 'escapeEverything': true });
            return user.save();
        })
        .then((user) => {
            res.status(200).json({});
        })
        .catch((err) => {
            handleError(res, err);
        });
    });

    router.post('/changeEmail', authenticate, function(req, res) {
        models.User.findOne({
            where: {
                id: req.user.id
            }
        })
        .then((user) => {
            user.email = req.body.email;
            return user.save();
        })
        .then((user) => {
            res.status(200).json({});
        })
        .catch((err) => {
            handleError(res, err);
        });
    });

    router.post('/sendResetEmail', function(req, res) {
        Promise.resolve(emailService.sendResetEmail(req.body.email.toLowerCase()))
            .then((user) => {
                res.status(200).json({});
            })
            .catch((err) => {
                handleError(res, err);
            });
    });

    router.post('/login', passport.authenticate(  
        'local', {
          session: false
        }), generateToken, respond);
    
    router.post('/fbLogin', fbLogin, generateToken, respond);
    
    router.post('/register', function(req, res) {
        const password = req.body.password.length < 6 ?
            req.body.password : jsesc(req.body.password, { 'escapeEverything': true });
        return models.User.create({
            email: req.body.email,
            password: password
        })
        .then(function(user) {
            emailService.sendRegisterEmail(user.email);
            res.status(201).json({});
        })
        .catch(function(err) {
            handleError(res, err);
        });
    });

    function handleError(res, err) {
        logger.error(JSON.stringify(err));
        if (err instanceof ServiceError) {
            res.status(400).send({ error: err });
        } else if (err instanceof Sequelize.ValidationError) {
            var e = err.errors[0];
            res.status(400).send({ error: new ServiceError(e.type, e.message, e.path) });
        } else if (err instanceof ExternalServiceError) {
            res.status(400).send({ error: err });
        } else {
            res.status(400).send({ error: new ServiceError('UnknownError') });
        }
    }
    return router;
}
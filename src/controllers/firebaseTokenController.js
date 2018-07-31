'use strict';

module.exports = function(models, authenticate, logger) {
    const Sequelize = require('sequelize');
    const express = require('express');
    const router = express.Router();
    const ExternalServiceError = require('../errors/externalServiceError.js').ExternalServiceError;
    const ServiceError = require('../errors/serviceError.js').ServiceError;

    router.post('/add', authenticate, function(req, res) {
        return models.User.findOne({
            where: {
                id: req.user.id
            }
        })
        .then((user) => {
            return models.FirebaseToken.upsert({
                userId: user.id,
                token: req.body.token,
                os: req.body.os,
                language: req.body.language
            });
        })
        .then((firebaseToken) => {
            res.status(200).json({});
        })
        .catch((err) => {
            handleError(res, err);
        });
    });

    router.post('/remove', authenticate, function(req, res) {
        var os = req.body.os || 'unknown';
        return models.FirebaseToken.destroy({
            where: {
                userId: req.user.id,
                token: req.body.token,
                os: os
            }
        })
        .then((FirebaseToken) => {
            res.status(200).json({});
        })
        .catch((err) => {
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
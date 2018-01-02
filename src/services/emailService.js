'use strict';
module.exports = function(config, models, logger) {

    const nodemailer = require('nodemailer');
    const jwt = require('jsonwebtoken');

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'eu4.1host.gr',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: config.email.username,
            pass: config.email.password
        }
    });

    function sendMail(mailOptions) {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.log({ level: 'error', message: error });
                throw error;
            } else {
                logger.log({ level: 'info', message: info });
            }
        });
    }

    nodemailer.sendRegisterEmail = function(email) {
        const subject = 'Καλωσήρθες στο Astro Lucis 🌞 ⭐ 🌛';
        const text = 'Καλωσήρθες στο Astro Lucis\n\n' + 
            'Προσφέρουμε προσωπικές ημερήσιες προβλέψεις δωρεάν!\n\n' +
            'Ξεκίνησε τώρα πηγαίνοντας στο ' + config.website.baseURL + '/login';

        const html = '<p><strong>Καλωσήρθες στο Astro Lucis</strong></p>' +
            '<p></p>' +
            '<p>Προσφέρουμε προσωπικές ημερήσιες προβλέψεις δωρεάν!<p>' +
            '<p></p>' +
            '<a href="' + config.website.baseURL + '/login">Ξεκίνα εδώ</a>';

        let mailOptions = {
            from: '"Astro Lucis" <hello@astrolucis.gr>',
            to: email,
            subject: subject,
            text: text,
            html: html
        };

        sendMail(mailOptions);
    }

    nodemailer.sendResetEmail = function(email) {
        models.User.findOne({
            where: { email }
        }).then((user) => {
            return Promise.resolve(jwt.sign({
                id: user.id,
                email: user.email,
                resetPassword: true
            }, config.jwt.secret, {
                expiresIn: config.jwt.resetPasswordTokenExpiration
            }));
        })
        .then((token) => {
            const subject = 'Αλλαγή κωδικού ασφαλείας';
            const text = 'Μάλλον ξέχασες τον κωδικό σου.\n\n' + 
                'Κανένα πρόβλημα! Ακολούθησε τον παρακάτω σύνδεσμο για να τον αλλάξεις!\n\n' +
                'Ο παρακάτω σύνδεσμος ισχύει για 30 λεπτά.\n\n' +
                config.website.baseURL + '/resetPassword?t=' + token;
    
            const html = '<p><strong>Μάλλον ξέχασες τον κωδικό σου.</strong></p>' +
                '<p></p>' +
                '<p>Κανένα πρόβλημα! Ακολούθησε τον παρακάτω σύνδεσμο για να τον αλλάξεις!<p>' +
                '<p></p>' +
                '<p>Ο παρακάτω σύνδεσμος ισχύει για 30 λεπτά.<p>' +
                '<a href="' + config.website.baseURL + '/resetPassword?t=' + token + '">Αλλαγή κωδικού</a>';
    
            let mailOptions = {
                from: '"Astro Lucis" <hello@astrolucis.gr>',
                to: email,
                subject: subject,
                text: text,
                html: html
            };
    
            sendMail(mailOptions);
        })
        .catch((error) => {
            logger.log({ level: 'error', message: error });
            return Promise.resolve({});
        });
    }

    return nodemailer;
}
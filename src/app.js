import 'babel-polyfill'

const config = require('./config/index');

import { logger } from './helpers/logger';
import { Person } from './chart/js/person';

Person._key = config.keys.googleAPIKEY;

const morgan = require('morgan')

const compression = require('compression')
const express = require('express');
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : config.jwt.secret});
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const models = require('./models')(config);
const graphqlSchema = require('./graphqlschema')(models, config, logger);
const authController = require('./controllers/authController');
const emailService = require('./services/emailService')(config, models, logger);
const cors = require('cors');
const mung = require('express-mung');

const app = express().use('*', cors());;

const format = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" req.body :reqBody res.body :resBody';

morgan.token('reqBody', function (req, res) { 
    return JSON.stringify(req.body);
});
morgan.token('resBody', function (req, res) { 
    return JSON.stringify(res.logBody);
});
app.use(compression())
app.use(mung.json(
    function transform(body, req, res) {
        res.logBody = body
        return body;
    }
));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan(morgan.compile(format), { stream: logger.stream }));
//app.use(require('serve-static')(__dirname + '/../../public'));
//app.use(require('cookie-parser')());
//app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use('/api/v1/auth', authController(config, app, models, emailService, authenticate, logger));

app.post('/graphql', authenticate, graphqlHTTP({
    schema: graphqlSchema,
    graphiql: false,
    formatError(error) {
        return error.originalError;
    }
}));
  
app.get('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    graphiql: true
}));

app.listen(config.server.port, function () {
    logger.log({
        level: 'info',
        message: 'AstroQL listening on port ' + config.server.port
    });
});

module.exports = app;
import { logger } from './helpers/logger';
const compression = require('compression')
const config = require("./config/config.json");
const express = require('express');
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : config.jwt.secret});
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const models = require('./models')(config);
const graphqlSchema = require('./graphqlschema')(models, logger);
const authController = require('./controllers/authController');
const emailService = require('./services/emailService')(config, models, logger);
const cors = require('cors');

const app = express().use('*', cors());;

app.use(compression())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(require('serve-static')(__dirname + '/../../public'));
//app.use(require('cookie-parser')());
//app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use('/api/v1/auth', authController(config, app, models, emailService, authenticate, logger));

app.post('/graphql', authenticate, graphqlHTTP({
    schema: graphqlSchema,
    graphiql: false
}));
  
app.get('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    graphiql: true
}));

app.listen(3579, function () {
    logger.log({
        level: 'info',
        message: 'AstroQL listening on port 3579!'
    });
});
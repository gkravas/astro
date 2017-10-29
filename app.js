const config = require("./config/config.json");
const express = require('express');
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : config.jwt.secret});
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const models = require('./models')(config);
const graphqlSchema = require('./graphqlschema')(models);
const authController = require('./controllers/authController');
const natalDateController = require('./controllers/natalDateController');
const dailyController = require('./controllers/dailyController');
const emailService = require('./services/emailService')(config, models);
const cors = require('cors');

const app = express().use('*', cors());;

var whitelist = ['http://localhost:4200']
var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
    } else {
        callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(require('serve-static')(__dirname + '/../../public'));
//app.use(require('cookie-parser')());
//app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use('/api/v1/auth', authController(config, app, models, emailService, authenticate));
//app.use('/api/v1', authenticate, natalDateController(config, app, models));
//app.use('/api/v1', authenticate, dailyController(config, app, models));


app.post('/graphql', authenticate, graphqlHTTP({
    schema: graphqlSchema,
    graphiql: false
}));
  
app.get('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    graphiql: true
}));

app.listen(3579, function () {
    console.log('AstroQL listening on port 3579!');
});
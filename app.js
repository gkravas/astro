const config = require("./config/config.json");
const express = require('express');
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : config.jwt.secret});
const bodyParser = require('body-parser');
const models = require('./models')(config);
const authController = require('./controllers/authController');
const natalDateController = require('./controllers/natalDateController');
const dailyController = require('./controllers/dailyController');


const app = express();

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type, Access-Control-Allow-Origin, Authorization");

    next();
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(allowCrossDomain);
//app.use(require('serve-static')(__dirname + '/../../public'));
//app.use(require('cookie-parser')());
//app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use('/api/v1/auth', authController(config, app, models));
app.use('/api/v1', authenticate, natalDateController(config, app, models));
app.use('/api/v1', authenticate, dailyController(config, app, models));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
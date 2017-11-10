const config = require('./config/index');
const models = require('./models')(config);

models.sequelize.sync({alter: true});
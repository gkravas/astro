const config = require("./config/config.json");
const models = require('./models')(config);

models.sequelize.sync({alter: true});
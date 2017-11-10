const environment = process.env.ENV || 'development'
module.exports = require(`./${environment}.json`);
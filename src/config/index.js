const environment = process.env.ENV || 'development'

var fs = require('fs');
var path = require('path');
module.exports = JSON.parse(fs.readFileSync(path.resolve(`./config/${environment}.json`), 'utf8'));
//module.exports = require(`../config/${environment}.json`);
const environment = process.env.NODE_ENV || 'development'

var fs = require('fs');
var path = require('path');
module.exports = JSON.parse(fs.readFileSync(path.resolve(`./config/${environment}.json`), 'utf8'));
//module.exports = require(`../config/${environment}.json`);
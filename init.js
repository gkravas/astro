const config = require('./config/index');
const models = require('./models')(config);
var fs = require('fs');
var parse = require('csv-parse');

//models.sequelize.sync({alter: true});
models.sequelize.sync({force: true})
    .then(function() {
        var parser = parse({delimiter: ','}, function(err, data){
            var row;
            for(i = 1; i < data.length; i++) {
                row = data[i];
                models.DailyPlanetAspectExplanation.upsert({
                    variation: 1,
                    natalPlanet: row[0],
                    dayPlanet: row[1],
                    aspect: row[2],
                    title: row[3],
                    lemma: row[4]
                });
            }
          });
          
          fs.createReadStream(__dirname + '/data/dailyPredicitonPlanets.csv').pipe(parser);
    });
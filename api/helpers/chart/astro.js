var swisseph = require ('swisseph');


// Test date
var date = {year: 1984, month: 8, day: 16, hour: 18.5};
console.log ('Date:', date);

var flag = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH;

// path to ephemeris data
swisseph.swe_set_ephe_path (__dirname + '/../ephe');

strtime = function (value) {
	var hour = Math.floor (value);
	var minFrac = (value - hour) * 60;
	var min = Math.floor (minFrac);
	var sec = Math.floor ((minFrac - min) * 60);

	return hour + ' ' + min + ' ' + sec;
};

logbody = function (name, body) {
    var lang = body.longitude;
    var house = Math.floor (lang / 30);
    var lang30 = lang - house * 30;

	console.log (name + ':', body.longitude, '|', strtime (lang30), '|', house, body.longitudeSpeed < 0 ? 'R' : '');
};

// Julian day
swisseph.swe_julday (date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL, function (julday_ut) {

	// Sun position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_SUN, flag, function (body) {
        logbody ('Sun', body);
	});

	// Moon position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_MOON, flag, function (body) {
        logbody ('Moon', body);
	});

	// Mercury position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_MERCURY, flag, function (body) {
				logbody ('Mercury', body);
	});

	// Venus position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_VENUS, flag, function (body) {
				logbody ('Venus', body);
	});

	// Mars position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_MARS, flag, function (body) {
				logbody ('Mars', body);
	});

	// Jupiter position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_JUPITER, flag, function (body) {
				logbody ('Jupiter', body);
	});

	// Saturn position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_SATURN, flag, function (body) {
				logbody ('Saturn', body);
	});

	// Uranus position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_URANUS, flag, function (body) {
				logbody ('Uranus', body);
	});

	// Neptune position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_NEPTUNE, flag, function (body) {
				logbody ('Neptune', body);
	});

	// Pluto position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_PLUTO, flag, function (body) {
				logbody ('Pluto', body);
	});

	// Mean node position
	swisseph.swe_calc_ut (julday_ut, swisseph.SE_MEAN_NODE, flag, function (body) {
        logbody ('Mean node', body);
	});

	swisseph.swe_calc_ut (julday_ut, swisseph.SE_TRUE_NODE, flag, function (body) {
        logbody ('True node', body);
	});

	swisseph.swe_calc_ut (julday_ut, swisseph.SE_MEAN_APOG, flag, function (body) {
        logbody ('Mean apog', body);
	});

	swisseph.swe_calc_ut (julday_ut, swisseph.SE_OSCU_APOG, flag, function (body) {
        logbody ('Oscu apog', body);
	});

	swisseph.swe_calc_ut (julday_ut, swisseph.SE_CHIRON, flag, function (body) {
        logbody ('Chiron', body);
	});
});

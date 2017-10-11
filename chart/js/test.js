"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const astrology_1 = require("./astrology");
let point = { lat: 40.736851, lng: 22.920227 };
let person;
let chart;
astrology_1.Person.create("George Kravas", "1984-08-16T18:30Z", "thessaloniki").then(p => {
    person = p;
    astrology_1.ChartFactory.create("Kenji's natal chart", person, null, astrology_1.ChartType.Transits).then(c => {
        chart = c;
        console.log(JSON.stringify(chart.outerPlanets, null, 4));
    }, err => console.error(err));
}, err => console.error(err));

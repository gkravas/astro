import { Person, Chart, ChartFactory, ChartType, Point } from "./astrology";

let point: Point = {lat: 40.736851, lng: 22.920227};
let person;
let chart;
Person.create("George Kravas", "1984-08-16T18:30Z", "thessaloniki").then(
    p => {
        person = p;
        ChartFactory.create("Kenji's natal chart", person).then(
          c => {
              chart = c;
              //console.log(JSON.stringify(chart.planets, null, 4));
          },
          err => console.error(err)
      );
    },
    err => console.error(err)
);

const request = require('request');
const readline = require('readline-sync');
const log4js = require('log4js');
const logger = log4js.getLogger('index.js');
const nr = require('./newRequest');

const ord = ['First' , 'Second' , 'Third' , 'Fourth' , 'Fifth'];


function getStops(pos) {
    const searchRadius = 2000;
    const stopProm = nr.newReq('https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram'
            + '%2CNaptanBusCoachStation&radius=' + searchRadius + '&useStopPointHierarchy'
            + '=true&modes=bus&returnLines=true&lat=' + pos.lat
            + '&lon=' + pos.lon+ '&app_id=25b29ea5&'
            + 'app_key=ff583ea695e335856a814aedcc475d9c')

        .then( data => {
            // Get stop ids for *numStops* closest stops
            let stops = Array(JSON.parse(data));
            let usedStops = [];

            stops[0].stopPoints.sort((stop1, stop2) => {
                return stop1.distance - stop2.distance
            });
            stops[0].stopPoints.splice(numStops); // get rid of extra stops
            stops[0].stopPoints.forEach(stop => {
                usedStops.push({
                    code: stop.id,
                    name: stop.commonName
                });
            });
            return usedStops
        })

        .catch(err => {
            console.log('An error occurred when requesting information about ' +
                'stops near the postcode from the internet.');
        });
    return stopProm
}

exports.getStops = getStops;
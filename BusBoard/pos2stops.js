const log4js = require('log4js');
const logger = log4js.getLogger('index.js');
const nr = require('./newRequest');
const classes = require('./classes');

function getStops(pos) {
    const numStops = 2;
    const searchRadius = 2000;
    return nr.newReq('https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram'
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
                usedStops.push(
                    new classes.Stop(stop.commonName, stop.id, [])
                );
            });
            return usedStops
        })

        .catch(() => {
            logger.fatal('Error in request postcode -> position.');
        });
}

exports.getStops = getStops;
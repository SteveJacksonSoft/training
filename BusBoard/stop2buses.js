const log4js = require('log4js');
const logger = log4js.getLogger('index.js');
const nr = require('./newRequest');
const classes = require('./classes');

function getBuses(stop) {

    const busReq = nr.newReq('https://api.tfl.gov.uk/StopPoint/' + stop.code +
        '/Arrivals?app_id=25b29ea5&app_key=ff583ea695e335856a814aedcc475d9c');

    return busReq.then(data => {
            let busList = JSON.parse(data);
            let numBuses = 5;

            // Cut and sort list of buses
            busList.sort((bus1, bus2) => {
                return bus1.expectedArrival - bus2.expectedArrival;
            });
            busList.splice(numBuses); // Get rid of extra buses

            // Add buses to stop.buses properties
            for (let i = 0; i < numBuses && i < busList.length; i++) {
                stop.buses[i] = new classes.Bus(busList[i].lineName,
                    busList[i].expectedArrival.slice(11,19),
                    busList[i].destinationName
                );
            }

            return stop
        })
        .catch((explanation) => {
            logger.fatal('Problem when requesting bus stop information. Stop Code: '
                + stop.code + '\nProgramme closing.');
            console.log(explanation);
            console.log('The programme will close.');
        });
}


exports.getBuses = getBuses;
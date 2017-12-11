const request = require('request');
const readline = require('readline-sync');
const log4js = require('log4js');
const logger = log4js.getLogger('index.js');

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

const ord = ['First' , 'Second' , 'Third' , 'Fourth' , 'Fifth'];

function newRequest(URL) {
    // Get JSON data from a URL - returns promise

    return new Promise((resolve, reject) => {
        request(URL, function(err, response, body) {
            if (err) {
                console.log('Error making request:', err);
            } // Error

            if (response.statusCode === 200) {
                logger.debug('Received data.');
                resolve(body);
            } else {
                logger.error('Bad request. Status code: ' + response.statusCode);
                logger.error('Body: ' + body);
                console.log('An error has occurred.');
                reject('An error occurred when requesting data from the Internet.');
            }
        });
    });
}

function printNextBuses(stops) {
    // Gets next 5 buses stopping at each stop (stops must be array of
    // objects {code, name}) from TFL

    let busReq = [];
    stops.forEach((stop, numOfStop) => {

        busReq[numOfStop] = newRequest('https://api.tfl.gov.uk/StopPoint/' + stop.code +
            '/Arrivals?app_id=25b29ea5&app_key=ff583ea695e335856a814aedcc475d9c');

        busReq[numOfStop].then(body => {
            if (stops.length > 1) {
                console.log('\n\n' + ord[numOfStop] + ' nearest bus stop: ' + stop.name);
            }
            let buses = JSON.parse(body);
            let numBuses = 5;
            // Print next numBuses buses in order of arrival
            for (let i = 0; i < numBuses; i++) {
                let nextBus = 0;
                buses.forEach(function (bus, i) {
                    if (bus.expectedArrival < buses[nextBus].expectedArrival) {
                        nextBus = i;
                    }
                });
                console.log('The ' + ord[i].toLowerCase() + ' bus will be the '
                    + buses[nextBus].lineName + '. Expected arrival time: '
                    + buses[nextBus].expectedArrival.slice(11, 19) + ' Destination: '
                    + buses[nextBus].destinationName);
                logger.debug('Printed ' + ord[i].toLowerCase() + ' bus.');
                buses.splice(nextBus, 1);
            }

        })
            .catch((explanation) => {
                logger.fatal('Problem when requesting bus stop information. Stop Code: '
                    + stopCode + '\nProgramme closing.');
                console.log(explanation);
                console.log('The programme will close.');
            });
    });
}

function searchByStopCode() {
    logger.debug('Searching by stop code.');

    console.log('Please enter a new bus stop code or enter q to quit.');
    const stopCode = readline.prompt();
    if (stopCode.toLowerCase() === 'q') {
        logger.debug('Programme terminating.');
        return
    }
    logger.debug('Received stop code: ' + stopCode);

    printNextBuses([{code: stopCode}]);
}

exports.search = searchByStopCode;
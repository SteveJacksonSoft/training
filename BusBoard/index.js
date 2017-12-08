const request = require('request');
const readline = require('readline-sync');
const moment = require('moment');
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

const ord = ['first' , 'second' , 'third' , 'fourth' , 'fifth'];

// Functions
function printNextBuses(stopCode) {
    // Gets next 5 buses stopping at stop from TFL

    request('https://api.tfl.gov.uk/StopPoint/' + stopCode + '/Arrivals?app_id=25b29ea5&app_key=ff583ea695e335856a814aedcc475d9c',
        function(err, response, body) {
            logger.debug('Received response from TFL.');
            console.log('Error:', err);
            console.log('statusCode:', response && response.statusCode);

            if (response === 404) {
                logger.error('Stop Code not valid');
                console.log('The bus stop code entered is not valid.');
                return
            } // Invalid stop code

            let buses = JSON.parse(body);

            // Assign different buses chronological rankings
            for (let i = 0; i<5; i++){
                let nextBus = 0;
                buses.forEach(function(bus, i) {
                    if (bus.expectedArrival < buses[nextBus].expectedArrival) {
                        nextBus = i;
                    }
                });
                console.log('The ' + ord[i] + ' bus will be the ' + buses[nextBus].lineName + '. Expected arrival time: ' + buses[nextBus].expectedArrival.slice(11,19) + ' Destination: ' + buses[nextBus].destinationName);
                logger.debug('Printed ' + ord[i] + ' bus.');
                buses.splice(nextBus,1);
            }
        }
    );


}


// Programme
logger.debug('Programme started.');
while(true) {
    console.log('Please enter a new bus stop code or enter q to quit.');
    const stopCode = readline.prompt();
    if (stopCode.toLowerCase() === 'q') {
        logger.debug('Programme terminating.');
        break
    }
    logger.debug('Received stop code: ' + stopCode);

    printNextBuses(stopCode);
}

console.log('Programme terminating.');
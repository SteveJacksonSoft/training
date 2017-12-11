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

const ord = ['First' , 'Second' , 'Third' , 'Fourth' , 'Fifth'];

// Functions
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

function searchByPostcode() {
    logger.debug('Searching by postcode.');
    console.log('Please enter a postcode.');
    const postcode = readline.prompt();
    // const postcode = 'se22 8hf';
    const numStops = 2; // Number of stops to display
    const postcodeReq = newRequest('https://api.postcodes.io/postcodes/' + postcode);

    postcodeReq.then( body => {
        const postcodeData = JSON.parse(body);
        const searchRadius = 2000;

        return newRequest('https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram'
            + '%2CNaptanBusCoachStation&radius=' + searchRadius + '&useStopPointHierarchy'
            + '=true&modes=bus&returnLines=true&lat=' + postcodeData.result.latitude
            + '&lon=' + postcodeData.result.longitude + '&app_id=25b29ea5&'
            + 'app_key=ff583ea695e335856a814aedcc475d9c');
        })
        .then(body => {
            // Get stop ids for *numStops* closest stops
            let stops = Array(JSON.parse(body));
            let usedStops = [];
            for (let i = 0; i < numStops && i <stops[0].stopPoints.length; i++) {
                let nextStop = 0;
                // Find next stop
                stops[0].stopPoints.forEach((stop, i) => {
                    if (stop.distance < stops[0].stopPoints[nextStop].distance) {
                        nextStop = i;
                    }
                });
                // Record next stop (name & code)
                usedStops.push({
                    code: stops[0].stopPoints[nextStop].id,
                    name: stops[0].stopPoints[nextStop].commonName
                });
                stops[0].stopPoints.splice(nextStop, 1);
            }

            // Get & print bus times
            printNextBuses(usedStops);
        })
        .catch((explanation) =>{
            logger.fatal('Problem when requesting postcode information. Postcode: '
                + postcode + '\nProgramme closing.');
            console.log(explanation);
            console.log('The programme will close.');
        });

}

function restartMain() {
    console.log('Would you like to make a new search? Enter q to quit.');
    let answer = readline.prompt().toLowerCase();

    if (answer !== 'q' && answer !== 'no' && answer !== 'no.') {
        main();
    }
}

function main(){
    console.log('Would you like to search by postcode or stop code?' +
        ' Enter "q" to quit.');
    let preference = readline.prompt().toLowerCase();
    // let preference = 'postcode';
    while (preference !== 'q') {

        // Ambiguous input?
        while (preference.indexOf('stop code') !== -1 && preference.indexOf('postcode') !== -1) {
            console.log('You have entered both "postcode" and "stop code". Please specify one or the other.');
            preference = readline.prompt();
        }

        // Start preferred routine
        if (preference.indexOf('postcode') !== -1) {
            searchByPostcode();
            return
        }
        if (preference.indexOf('stop code') !== -1) {
            searchByStopCode();
            return
        }

        // Unsuitable command:
        console.log("You haven't entered a suitable command. Please try again.");
        console.log('Would you like to search by postcode or stop code?' +
            ' Enter "q" to quit.');
        logger.debug('Unsuitable command. Asking again.');
        preference = readline.prompt().toLowerCase();
    }

    console.log('Programme closing.');
}


// Programme
logger.debug('Programme started.');

main();
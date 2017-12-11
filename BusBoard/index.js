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

const pc2pos = require('./pc2pos');
const pos2stops = require('./pos2stops');
const s2bus = require('./stop2buses');
const print = require('./printBuses');

const ord = ['First' , 'Second' , 'Third' , 'Fourth' , 'Fifth'];


// Classes


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
                buses.sort((bus1, bus2) => {
                    return bus1.expectedArrival - bus2.expectedArrival;
                });
                buses.splice(numBuses); // Get rid of extra buses
                buses.slice(0,numBuses).forEach(bus => {

                    console.log('The ' + ord[i].toLowerCase() + ' bus will be the '
                        + bus.lineName + '. Expected arrival time: '
                        + bus.expectedArrival.slice(11, 19) + ' Destination: '
                        + bus.destinationName);
                    logger.debug('Printed ' + ord[i].toLowerCase() + ' bus.');

                });
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

    // Enter postcode
    logger.debug('Searching by postcode.');
    console.log('Please enter a postcode.');
    const postcode = readline.prompt();

    // Find Lat and Long
    const numStops = 2; // Number of stops to display
    let postcodeProm = new Promise((resolve,reject) => resolve(postcode));

        //PC to Position
    postcodeProm.then(postcode => pc2pos.getLatLon(postcode))

        // Position to stop points
        .then(pos => pos2stops.getStops(pos))

        // Stop points to stops with bus lists
        .then(buslessStops => {
            const busStops = [];
            buslessStops.forEach(stop => {
                busStops.push(s2bus.getBuses(stop));
            });
            return Promise.all(busStops)
        })

        // Print buses
        .then(stops => print.printBuses(stops))

        // Handle rejected promise
        .catch(err => {
            console.log(err);
            console.log('Programme closing.')
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

    while (preference !== 'q') {
        // Ambiguous input?
        while (preference.indexOf('stop code') !== -1 && preference.indexOf('postcode') !== -1) {
            console.log('You have entered both "postcode" and "stop code". Please specify one or the other.');
            preference = readline.prompt();
        }

        // Start preferred routine
        if (preference.indexOf('postcode') !== -1) {
            // searchByPostcode();
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
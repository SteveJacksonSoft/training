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

const classes = require('./classes');
const pc2pos = require('./pc2pos');
const pos2stops = require('./pos2stops');
const s2bus = require('./stop2buses');
const print = require('./printBuses');

function searchByStopCode() {
    logger.debug('Searching by stop code.');

    console.log('Please enter a bus stop code or enter q to quit.');
    const stopCode = readline.prompt();

    if (stopCode.toLowerCase() === 'q') {
        logger.debug('Programme terminating.');
        return
    }
    logger.debug('Received stop code: ' + stopCode);

    let stop = new classes.Stop('',stopCode,[]);

    const busReq = s2bus.getBuses(stop);
    busReq.then(stop => print.printBuses([stop]))
        .catch(err => {
            console.log(err);
            console.log('Programme closing.');
        })
}

function searchByPostcode() {

    // Enter postcode
    logger.debug('Searching by postcode.');
    console.log('Please enter a postcode.');
    const postcode = readline.prompt();
    // const postcode = 'aopifdn';
    // Find Lat and Long
    const numStops = 2; // Number of stops to display
    let postcodeProm = new Promise((resolve,reject) => resolve(postcode));

        //PC to Position
    const checkProm = postcodeProm.then(postcode => pc2pos.getLatLon(postcode));

        // Position to stop points
    checkProm.then(pos => pos2stops.getStops(pos))

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

        // Restart command if desired
        .then(() => {
            restartCommand();
        })
        // Handle rejected promise
        .catch(err => {
            console.log(err);
            console.log('Programme closing.')
        });
}

function restartCommand() {
    console.log('\nWould you like to make a new search? Enter q to quit.');
    let answer = readline.prompt().toLowerCase();

    if (answer !== 'q' && answer !== 'no' && answer !== 'no.') {
        command();
    }
}

function command(){
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

command();
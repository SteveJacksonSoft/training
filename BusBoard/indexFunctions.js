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

function explainErrorPC(statusCode) {
    switch (+statusCode) {
        case 400:
            console.log('You have entered an invalid postcode.');
            console.log('The postcode must be in London.');
            break;
        case 404:
            console.log('You have entered an invalid postcode.');
            console.log('The postcode must be in London.');
            break;
        case 500:
            console.log('A server error has occurred.');
            break;
    }
}

function explainErrorSC(statusCode) {
    switch (statusCode) {
        case 400:
            console.log('You have entered an invalid stop code.');
            break;
        case 404:
            console.log('You have entered an invalid stop code.');
            break;
        case 500:
            console.log('A server error has occurred.');
            break;
    }
}

function searchByStopCode(stopCode, fromWebApp) {

    // Make Stop out of stopCode
    let stop = new classes.Stop('',stopCode,[]);

    // Get list of buses
    const busReq = s2bus.getBuses(stop);

    if (fromWebApp) {
        // Return data to webapp
        return busReq
    } else {
            // Print buses
        busReq.then(stop => {
                print.printBuses([stop]);
                restartCommand();
            })
            // Explain error
            .catch(err => {
                console.log(err.message);
                logger.error('Showing?');
                explainErrorSC(err.statusCode);
                restartCommand();
            })
    }

}

function searchByPostcode(postcode, fromWebApp) {

    // Find Lat and Long
    let postcodeProm = new Promise((resolve,reject) => resolve(postcode));

    //PC to Position
    const checkProm = postcodeProm.then(postcode => pc2pos.getLatLon(postcode));

    // Position to stop points
    const stopProm = checkProm.then(pos => {
            logger.debug('Received position of postcode.');
            return pos2stops.getStops(pos);
        })

    // Stop points to stops with bus lists
        .then(buslessStops => {
            logger.debug('Received stop list from position.');
            const busStops = [];
            buslessStops.forEach(stop => {
                busStops.push(s2bus.getBuses(stop));
            });
            return Promise.all(busStops)
        });

    if (fromWebApp) {
        // Respond with buses in JSON
        return stopProm
    } else {
            // Print buses and restart if desired
        stopProm.then(stops => {
                logger.debug('Received bus info for stops.');
                print.printBuses(stops);
                restartCommand();
            })
            // Handle rejected promise
            .catch(err => {
                console.log(err.message);
                explainErrorPC(err.statusCode);
                logger.error('Restarting programme.');
                restartCommand();
            });
    }

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
            // Enter postcode
            logger.debug('Searching by postcode.');
            console.log('Please enter a postcode.');
            const postcode = readline.prompt();
            // const postcode = 'aopifdn';
            logger.debug('Received postcode: ' + postcode);
            searchByPostcode(postcode);
            return
        }
        if (preference.indexOf('stop code') !== -1) {
            logger.debug('Searching by stop code.');
            console.log('Please enter a bus stop code');
            const stopCode = readline.prompt();
            // const stopCode = 'aofin';
            logger.debug('Received stop code: ' + stopCode);
            searchByStopCode(stopCode);
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

exports.pcSearch = searchByPostcode;
exports.scSearch = searchByStopCode;
exports.command = command;
exports.restartCommand = restartCommand;
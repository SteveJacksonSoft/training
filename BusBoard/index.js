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
function newRequest(URL) {
    // Get JSON data from a URL

    return new Promise((resolve, reject) => {
        request(URL, function(err, response, body) {
            if (err) {
                console.log('Error making request:', err);
            } // Error

            if (response.statusCode === '200') {
                logger.debug('Received data.');
                console.log('Success');
                resolve(body);
            } else {
                logger.error('Bad request.');
                console.log('An error has occurred.');
                reject('Request error.');
            } // Response
        });
    });
}

function printNextBuses(stopCode) {
    // Gets next 5 buses stopping at stop from TFL

    const busReq = newRequest('https://api.tfl.gov.uk/StopPoint/' + stopCode +
        '/Arrivals?app_id=25b29ea5&app_key=ff583ea695e335856a814aedcc475d9c');

    busReq.then(body =>{
        let buses = JSON.parse(body);

        // Print buses in order of arrival
        for (let i = 0; i<5; i++) {
            let nextBus = 0;
            buses.forEach(function(bus, i) {
                if (bus.expectedArrival < buses[nextBus].expectedArrival) {
                    nextBus = i;
                }
            });
            console.log('The ' + ord[i] + ' bus will be the '
                + buses[nextBus].lineName + '. Expected arrival time: '
                + buses[nextBus].expectedArrival.slice(11,19) + ' Destination: '
                + buses[nextBus].destinationName);
            logger.debug('Printed ' + ord[i] + ' bus.');
            buses.splice(nextBus,1);
        }

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

    printNextBuses(stopCode);
}

function searchByPostcode() {
    logger.debug('Searching by postcode.');
    console.log('Please enter a postcode.');
    // const postcode = readline.prompt();
    const postcode = 'se22 8hf';
    const numStops = 2; // Number of stops to display
    const postcodeReq = newRequest('https://api.postcodes.io/postcodes/' + postcode);

    postcodeReq.then( body => {
        const postcodeData = JSON.parse(body);
        const searchRadius = 2000;

        return newRequest('https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram'
            + '%2CNaptanBusCoachStation&radius=' + searchRadius + '&useStopPointHierarchy'
            + '=true&modes=bus&returnLines=true&lat=' + postcodeData.result.latitude
            + '&lon=' + postcodeData.result.longitude + '?app_id=25b29ea5&'
            + 'app_key=ff583ea695e335856a814aedcc475d9c');
        })
        .then(body => {
            // Get stop ids for *numStops* closest stops
            let stops = Array(JSON.parse(body));
            let stopCodes = [];

            // Get next closest stops iteratively
            for (let i = 0; i < numStops; i++) {
                let nextStop = 0;
                stops.forEach(function (stop, i) {
                    if (stop.distance < stops[nextStop].distance) {
                        nextStop = i;
                    }
                });
                stopCodes.push(stops[nextStop].id);
                stops.splice(nextStop, 1);
            }

            // Get bus times
            for (let i = 0; i < numStops; i++) {
                printNextBuses(stopCodes[i]);
            }
        });
}



// Programme
let preference = '';

while (preference !== 'q') {
    logger.debug('Programme started.');
    console.log('Would you like to search by postcode or stop code? Enter "q" to quit.');
    let preference = readline.prompt().toLowerCase();
    // const preference = 'postcode';

    while (preference.indexOf('stop code') !== -1 && preference.indexOf('postcode') !== -1) {
        console.log('You have entered both "postcode" and "stop code". Please specify one or the other.');
        preference = readline.prompt();
    }

    if (preference.indexOf('postcode') !== -1) {
        searchByPostcode();
        return
    }
    if (preference.indexOf('stop code') !== -1) {
        searchByStopCode();
        return
    }
    console.log("You haven't entered a suitable command.");
}
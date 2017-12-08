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
            if (err) {
                console.log('Error:', err);
            } // Error
            switch(response.statusCode) { //
                case '200':
                    logger.debug('Valid stop code. Received data.');
                    console.log('Success');
                    break;
                case '400':
                    logger.error('Bad request.');
                    console.log('The bus stop code entered is not valid.');
                    return;
                case '404':
                    logger.error('Stop Code not valid');
                    console.log('The bus stop code entered is not valid.');
                    return;
                case '500':
                    logger.error('Server error.');
                    console.log('A server error has occurred.');
                    break;
            } // Response

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

    searchByStopCode();
}

function searchByPostcode() {
    logger.debug('Searching by postcode.');
    console.log('Please enter a postcode.');
    // const postcode = readline.prompt();
    const postcode = 'se22 8hf';
    const numStops = 2; // Number of stops to display
    const reqPostcodeArea = new Promise((resolve,reject) => {
        request('https://api.postcodes.io/postcodes/' + postcode,
            function (err, response, body) {
                resolve([err, response, body])
            }
        );
    });

    reqPostcodeArea.then( (err, response, body)
        switch (body.status) {
            case '200':
                logger.debug('Valid postcode. Received data.');
                console.log('Success');
                break;
            case '400':
                logger.error('Bad request.');
                console.log('The bus postcode entered is not valid.');
                return;
            case '404':
                logger.error('Postcode not valid');
                console.log('The bus postcode entered is not valid.');
                return;
            case '500':
                logger.error('Server error.');
                console.log('A server error has occurred.');
                return;
        } // If errors in getting postcode
        const postcodeData = JSON.parse(body);
        const searchRadius = 2000;
        request('https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram%2CNaptanBusCoachStation&radius=' + searchRadius + '&useStopPointHierarchy=true&modes=bus&returnLines=true&lat=' + postcodeData.result.latitude + '&lon=' + postcodeData.result.longitude + '?app_id=25b29ea5&app_key=ff583ea695e335856a814aedcc475d9c',
            function (err, response, body) {

        // Get stop ids for *numStops* closest stops
        let stops = Array(JSON.parse(body));
        let stopCodes = [];
        console.log(stops);
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
        }
        );
    )

}

// const promise = new Promise((resolve, reject) => {
//    readline.question('bigman', resolve)
// });
// console.log(promise);
// promise.then(answer => console.log(answer.length), ()=> console.log('explain!'))
//     .then(()=> 'pig')
//     .then(me => console.log(me.length))
//     .catch(err => console.log(err));


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
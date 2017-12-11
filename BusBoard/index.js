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

const pcSearch = require('./postcodeSearch');
const scSearch = require('./stopCodeSearch');
const ord = ['First' , 'Second' , 'Third' , 'Fourth' , 'Fifth'];

// Functions

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
            // searchByPostcode();
            pcSearch.search()
            return
        }
        if (preference.indexOf('stop code') !== -1) {
            scSearch.search();
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
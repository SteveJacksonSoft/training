const request = require('request');
const log4js = require('log4js');
const logger = log4js.getLogger('index.js');


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
                reject({
                    message: 'An error occurred when requesting data from the Internet.',
                    statusCode: response.statusCode
                });
            }
        });
    });
}

exports.newReq = newRequest;
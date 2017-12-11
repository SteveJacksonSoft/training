const request = require('request');
const readline = require('readline-sync');
const log4js = require('log4js');
const logger = log4js.getLogger('index.js');
const nr = require('./newRequest');
const ord = ['First' , 'Second' , 'Third' , 'Fourth' , 'Fifth'];

function getLatLon(postcode) {

    const posProm = nr.newReq('https://api.postcodes.io/postcodes/' + postcode)

        .then( data => {
            const lat = data.result.latitude;
            const lon = data.result.longitude;
            return {lat: lat, lon: lon}
        })

        .catch((explanation) =>{
            logger.fatal('Problem when requesting postcode information. Postcode: '
                + postcode /* + '\nProgramme closing.'*/);
            console.log(explanation);
            // console.log('The programme will close.');
        });

    return posProm
}

exports.getLatLon = getLatLon;
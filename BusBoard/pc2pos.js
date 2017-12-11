const log4js = require('log4js');
const logger = log4js.getLogger('index.js');
const nr = require('./newRequest');

function getLatLon(postcode) {

     return nr.newReq('https://api.postcodes.io/postcodes/' + postcode)

        .then(data => {
            const parsedData = JSON.parse(data);
            const lat = parsedData.result.latitude;
            const lon = parsedData.result.longitude;
            return {lat: lat, lon: lon}
        })

        .catch((explanation) =>{
            logger.fatal('Problem when requesting postcode information. Postcode: '
                + postcode /* + '\nProgramme closing.'*/);
            console.log(explanation);
            // console.log('The programme will close.');
        });
}

exports.getLatLon = getLatLon;
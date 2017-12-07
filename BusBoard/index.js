const request = require('request');
const readline = require('readline-sync');
const moment = require('moment');

function getStopCode() {
    // Gets new bus stop code from user

    console.log('Please enter a bus stop code.');
    return readline.prompt();
}

function printNextBuses(stopCode) {
    // Gets next 5 buses stopping at stop from TFL
    
    let data;

    request('https://api.tfl.gov.uk/StopPoint/' + stopCode + '/Arrivals?app_id=25b29ea5&app_key=ff583ea695e335856a814aedcc475d9c',
        function(err, response, body) {
            console.log('Error:', err);
            console.log('statusCode:', response && response.statusCode);
            let data = JSON.parse(body);

            // // Assign different buses chronological rankings
            // data.forEach(bus => {
            //
            // });

            for (let i = 0; i < 5; i++) {
                console.log('Bus ' + (i + 1) + ' will be the ' + data[i].lineName + '. Expected arrival time: ' + data[i].expectedArrival + ' Destination: ' + data[i].destinationName)
            }
        }
    );

    // const tflData = JSON.parse(data);

    console.log('Here');
}

printNextBuses('490008660N');
const ord = ['First' , 'Second' , 'Third' , 'Fourth' , 'Fifth'];

function printBuses(stops) {
    stops.forEach((stop, stopNum) => {
        if (stops.length > 1) {
            console.log('\n\n' + ord[stopNum] + ' nearest stop: ' + stop.name);
        }
        stop.buses.forEach((bus, busNum) => {
            console.log('The ' + ord[busNum].toLowerCase() + ' bus at ' + stop.name + ' will be the '
                + bus.number + ' to ' + bus.destination + ', arriving at ' + bus.arrivalTime);
        });
    });
}

exports.printBuses = printBuses;
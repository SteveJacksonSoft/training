function stops2html(stops) {
    var busesString;
    var stopString = [];
    stops.forEach(stop => {
        busesString = [];

        stop.buses.forEach(bus => {
            busesString.push(`<li>${bus.arrivalTime}: ${bus.number} to ${bus.destination}</li>`);
        });

        stopString.push(
            `<br>
             <h3>${stop.name}</h3>
             <ul>
                ${busesString.join('\n')}
             </ul>`
        );
    });
    return `<h2>Results</h2>
                ${stopString.join('\n')}`;
}


function searchPostcode() {
    var postcode = document.getElementById('postcode').value;
    var xhttp = new XMLHttpRequest();
    console.log('Searching for buses at ' + postcode);

    xhttp.open('GET', 'http://localhost:3000/postcodesearch?postcode=' + postcode, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onload = function () {
        var stops = JSON.parse(xhttp.responseText);
        document.getElementById('results').innerHTML = stops2html(stops);
    };
    xhttp.send();
}
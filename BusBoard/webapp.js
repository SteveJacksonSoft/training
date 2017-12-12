const express = require('express');
const app = express();

const index = require('./indexFunctions');

app.use(express.static('frontend'));

// Postcode search
app.get('/postcodesearch', (req, res) => {
    const postcode = req.query.postcode;
    const stopProm = index.pcSearch(postcode, true);
    stopProm.then(stops => res.json(stops))
        .catch(err => {
             if (err.statusCode === 400 || err.statusCode === 404) {
                 res.send('Invalid postcode.');
            }
            if (err.statusCode === 500) {
                res.send('A server error has occurred.');
            }
        });
});

// Stop code search
app.get('/stopcodesearch', (req, res) => {
    const stopCode = req.query.stopcode;
    const stopProm = index.scSearch(stopCode, true);
    stopProm.then(stop => res.json(stop))
        .catch(err => {
            if (err.statusCode === 400 || err.statusCode === 404) {
                res.send('Invalid stop code.');
            }
            if (err.statusCode === 500) {
                res.send('A server error has occurred.');
            }
        });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
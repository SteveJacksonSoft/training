const fs = require('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('index.js');
const moment = require('moment-msdate');


class Transaction {
    constructor(date, from, to, narrative, amount) {
        this.date = date;
        this.from = from;
        this.to = to;
        this.reason = narrative;
        this.amount = amount;
    };

    toString() {
        return 'Date: ' + this.date + '; From: ' + this.from + '; To: ' + this.to + '; Reason: ' + this.reason + '; Amount: ' + this.amount;
    }
}

function linesToTrans(lines, fileName) {
    // Returns list of transactions from  lines of CSV

    let trans = [];

    for (let i = 0; i < lines.length; i++) {

        const [date, from, to, reason, amount] = lines[i].split(',');

        if (date && from && to && reason && amount) { // Avoid lines containing undefined
            // Log problems
            if (typeof date !== 'string') {
                logger.debug('trans[' + i + ']: date is of wrong format.');
            }
            if (typeof from !== 'string') {
                logger.debug('trans[' + i + ']: from is of wrong format.');
            }
            if (typeof to !== 'string') {
                logger.debug('trans[' + i + ']: to is of wrong format.');
            }
            if (typeof reason !== 'string') {
                logger.debug('trans[' + i + ']: reason is of wrong format.');
            }
            if (isNaN(+amount)) {
                logger.debug('trans[' + i + ']: amount is not a number.');
                console.log('The amount in line ' + (i+2) + ' of ' + fileName + ' is not a number. This transaction will be discounted when calculating the balances of ' + from + ' and ' + to + '.');
            }

            // Make transaction
            trans.push(new Transaction( moment(date, 'DD-MM-YYYY')._d.toString().slice(0,15) , from, to, reason, +amount));
        }

    }
    return trans
}

function addNewCSVTrans(fileName) {
    // Returns list of transactions from a CSV file

    const newData = fs.readFileSync(fileName,'utf8');
    let lines = newData.split('\n');
    lines.splice(0,1); // Get rid of title line

    return linesToTrans(lines, fileName)
}

exports.addcsv = addNewCSVTrans;
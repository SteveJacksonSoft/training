const fs = require('fs');
const moment = require('moment-msdate');
const xml2js = require('xml2js');

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

function addNewXMLTrans(fileName) {
    // Returns list of transactions from an XML file

    const newFile = fs.readFileSync(fileName, 'utf8');

    let trans = [];

    xml2js.parseString(newFile, function (err, result) {
        let date, narrative, from, to, amount;
        for (let i = 0; i< result.TransactionList.SupportTransaction.length; i++) {
            const transact = result.TransactionList.SupportTransaction[i];

            if (isNaN(transact.$.Date)) {
                console.log('The date entered in transaction ' + (i + 1) + ' of the file ' + fileName + ' is not a valid MSDate.');
                logger.warn('');
                date = 'Invalid Date';
            } else {
                date = moment.fromOADate(transact.$.Date)._d.toString().slice(0, 15);
            }

            narrative = transact.Description[0];
            from = transact.Parties[0].From[0];
            to = transact.Parties[0].To[0];

            if (isNaN(transact.Value[0])) {
                console.log('The amount entered in transaction ' + (i + 1) + ' of the file ' + fileName + ' is not a number.');
            }
            amount = + transact.Value[0];

            if (date && from && to && narrative && amount) {
                trans.push(new Transaction(date, from, to, narrative, amount));
            }
        }
    });

    return trans
}

exports.addxml = addNewXMLTrans;
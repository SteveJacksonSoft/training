const fs = require('fs');
const moment = require('moment-msdate');
const xml2js = require('xml2js');

class Transaction{
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
        result.TransactionList.SupportTransaction.forEach(transact => {

            const date = moment.fromOADate(transact.$.Date)._d.toString().slice(0,15);
            const narrative = transact.Description[0];
            const from = transact.Parties[0].From[0];
            const to = transact.Parties[0].To[0];
            const amount = + transact.Value[0];

            trans.push(new Transaction(date, from, to, narrative, amount));
        });
    });

    return trans
}

exports.addxml = addNewXMLTrans;
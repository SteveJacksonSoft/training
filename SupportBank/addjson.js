const fs = require('fs');
const moment = require('moment-msdate');
const log4js = require('log4js');
const logger = log4js.getLogger('index.js');

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

function addNewJSONTrans(fileName) {
    // Returns list of transactions from a JSON file

    const newData = fs.readFileSync(fileName,'utf8');
    const parsedData = JSON.parse(newData);

    return parsedData.map( transact => {
        new Transaction(moment(transact.Date)._d.toString().slice(0,15),
            transact.FromAccount,
            transact.ToAccount,
            transact.Narrative,
            transact.Amount)} );
}

exports.addjson = addNewJSONTrans;
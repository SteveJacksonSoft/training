const fs = require('fs');
const moment = require('moment-msdate');

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
    let transList = [];
    parsedData.forEach(transact => {
        transList.push( new Transaction(moment(transact.Date)._d.toString().slice(0,15), transact.FromAccount, transact.ToAccount, transact.Narrative, transact.Amount));
    });
    return transList
}

exports.addjson = addNewJSONTrans;
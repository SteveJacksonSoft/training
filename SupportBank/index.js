const readline = require('readline-sync');
const fs = require('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('index.js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

logger.debug('SupportBank has started.');


// Classes
class Account{
    constructor(name, transList) {
        this.name = name;
        this.balance = findBalance(name, transList);
    };
}

class Transaction{
    constructor(date, from, to, narrative, amount) {
        this.date = date;
        this.from = from;
        this.to = to;
        this.reason = narrative;
        this.amount = amount;
    };

    toString() {
        return 'Date:' + this.date + '; From: ' + this.from + '; To: ' + this.to + '; Reason: ' + this.reason + '; Amount: ' + this.amount;
    }
}


// Functions
function findBalance( name , transList ) {
    // Finds the balance of an account by looking through the list of transactions

    let balance = 0;
    for ( let i = 0; i < transList.length; i++){

        if ( transList[i].from === name ){
            balance -= transList[i].amount;
            balance = Math.round(balance*100) / 100;
        }

        if ( transList[i].to === name){
            balance += transList[i].amount;
            balance = Math.round(balance*100) / 100;
        }
    }

    return balance
}

function listAll(accounts) {
    // Lists all accounts in the array

    for (let i = 0; i < accounts.length; i++) {
        console.log(accounts[i].name + ' ' + accounts[i].balance + '\n');
    }
}

function listTrans(name, transList) {
    // Lists transactions in transList involving the name

    transList.forEach(transact => {

        if ( transact.from.toLowerCase() === name.toLowerCase() || transact.to.toLowerCase() === name.toLowerCase() ){
            const transString = transact.toString();
            console.log(transString);
        }

    });
}

function cleanArray(inputArray) {
    // Removes undefined entries from an array

    for ( let i = 0; i <inputArray.length; i++ ){

        while ( inputArray[i] === undefined && i < inputArray.length){
            inputArray.splice(i,1);
        }

    }

    return inputArray
}

function linesToTrans(lines) {
    // Returns list of transactions from  lines of CSV

    let trans = [];

    for (let i = 0; i < lines.length; i++) {

        const [date, from, to, reason, amount] = lines[i].split(',');

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
            console.log('The amount in line ' + i + ' of the inputted data is not a number. This will mean that the balance of anyone involved in this transaction(' + from + ' and ' + to + ') will not be given.');
        }

        // Make transaction
        if (date && from && to && reason && amount) { // Avoid lines containing undefined
            trans.push(new Transaction(date, from, to, reason, +amount));
        }

    }
    return trans
}

function createAccounts(trans) {
    // Returns list of accounts for anyone involved in the trans list

    let people = [];
    let accounts = [];

    trans.forEach(function(transact) { // Get list of names and make their accounts
        if ( people.indexOf( transact.from ) === -1 ){
            people.push( transact.from );
            let newAccount = new Account( transact.from , trans );
            accounts.push(newAccount);
        }

        if ( people.indexOf( transact.to ) === -1 ){
            people.push( transact.to );
            let newAccount = new Account( transact.to , trans );
            accounts.push(newAccount);
        }
    });
    return accounts
}

function addNewCSVTrans(fileName) {
    // Returns list of transactions from a CSV file

    const newData = fs.readFileSync(fileName,'utf8');
    let lines = newData.split('\n');
    lines.splice(0,1); // Get rid of title line
    lines = cleanArray(lines); // Get rid of undefined lines

    return linesToTrans(lines)
}

function addNewJSONTrans(fileName) {
    // Returns list of transactions from a JSON file

    const newData = fs.readFileSync(fileName,'utf8');
    const parsedData = JSON.parse(newData);
    let transList = [];
    parsedData.forEach(transact => {
        transList.push( new Transaction(transact.Date, transact.FromAccount, transact.ToAccount, transact.Narrative, transact.Amount));
    });
    return transList
}



// Create transactions and accounts
const trans2013 = addNewJSONTrans('Transactions2013.json');
const trans2014 = addNewCSVTrans('Transactions2014.csv');
const trans2015 = addNewCSVTrans('DodgyTransactions2015.csv');
const trans = trans2013.concat(trans2014, trans2015);
let accounts = createAccounts(trans);


// Commands
while (true) {
    console.log(' Enter a command ("List All" or "List Account [Name]") or enter "q" to quit.');
    let command = readline.prompt();

    if ( command.toLowerCase() === 'q' ){
        break
    }
    if ( command === 'List All' ){
        listAll(accounts);
    }else{
        for ( let i = 0; i < accounts.length; i++){

            if ( command.indexOf( accounts[i].name ) !== -1 ){
                listTrans( accounts[i].name , trans );
                break
            }

        }
    }


}
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

function listAll() {
    for (let i = 0; i < accounts.length; i++) {
        console.log(accounts[i].name + ' ' + accounts[i].balance + '\n');
    }
}

function listTrans(name, transList) {
    transList.forEach(transact => {

        if ( transact.from.toLowerCase() === name.toLowerCase() || transact.to.toLowerCase() === name.toLowerCase() ){
            const transString = transact.toString();
            console.log(transString);
        }

    });
}

function cleanArray(inputArray) {
    for ( let i = 0; i <inputArray.length; i++ ){

        while ( inputArray[i] === undefined && i < inputArray.length){
            inputArray.splice(i,1);
        }

    }

    return inputArray
}

function createTrans(lines) {

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


// Read and parse data
const data2014 = fs.readFileSync('Transactions2014.csv','utf8');
const data2015 = fs.readFileSync('DodgyTransactions2015.csv','utf8');
const lines2014 = data2014.split('\n');
const lines2015 = data2015.split('\n');
let lines = lines2014.slice(1).concat( lines2015.slice(1) ); // Get rid of title lines and concat
lines = cleanArray( lines ); // Get rid of undefined lines


// Create transactions and accounts
let trans = createTrans(lines);
let accounts = createAccounts(trans);


// Get rid of undefineds - may be unnecessary
accounts = cleanArray( accounts );
trans = cleanArray( trans );


// Commands
while (true){
    console.log(' Enter a command ("List All" or "List Account [Name]") or enter "q" to quit.');
    let command = readline.prompt();

    if ( command.toLowerCase() === 'q' ){
        break
    }
    if ( command === 'List All' ){
        listAll();
    }else{
        for ( let i = 0; i < accounts.length; i++){

            if ( command.indexOf( accounts[i].name ) !== -1 ){
                listTrans( accounts[i].name , trans );
                break
            }

        }
    }


}
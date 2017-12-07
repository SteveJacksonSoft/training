const readline = require('readline-sync');
const moment = require('moment-msdate');
const log4js = require('log4js');
const addCSV = require('./addcsv.js');
const addJSON = require('./addjson.js');
const addXML = require('./addxml.js');
const logger = log4js.getLogger('index.js');

// Moment tryout
let date1 = moment('21/3/14', 'DD-M-YY');
let date2 = moment("2013-01-05T00:00:00");
console.log(date1);
console.log(date2);



// Logger configuration
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

logger.info('SupportBank has started.');


// Classes
class Account {
    constructor(name, transList) {
        this.name = name;
        this.balance = findBalance(name, transList);
    };
}


// Functions
function findBalance( name , transList ) {
    // Finds the balance of an account by looking through the list of transactions

    let balance = 0;
    for ( let i = 0; i < transList.length; i++){

        if ( transList[i].from === name ){
            if (isNaN(transList[i].amount)) {
                logger.warn('Amount in transaction ' + i + ' is not a number. Balance of ' + name + ' will not be modified.');

            } else {
                balance -= transList[i].amount;
                balance = Math.round(balance * 100) / 100;
            }
        }

        if ( transList[i].to === name){
            if (isNaN(transList[i].to)) {
                logger.warn('Amount in transaction ' + i + ' is not a number. Balance of ' + name + ' will not be modified.');
            } else {
                balance += transList[i].amount;
                balance = Math.round(balance * 100) / 100;
            }
        }
    }

    return balance
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

// Create transactions and accounts
const trans2012 = addXML.addxml('Transactions2012.xml');
const trans2013 = addJSON.addjson('Transactions2013.json');
const trans2014 = addCSV.addcsv('Transactions2014.csv');
const trans2015 = addCSV.addcsv('DodgyTransactions2015.csv');
const trans = trans2012.concat(trans2013, trans2014, trans2015);
let accounts = createAccounts(trans);


// Commands
while (true) {
    console.log(' Enter a command ("List All" or "List Account [Name]") or enter "q" to quit.');
    let command = readline.prompt();

    if (command.toLowerCase() === 'q') {
        break
    }
    if (command === 'List All') {
        listAll(accounts);
    } else {
        for (let i = 0; i < accounts.length; i++) {

            if (command.indexOf(accounts[i].name) !== -1) {
                listTrans(accounts[i].name, trans);
                break
            }

        }
    }

}
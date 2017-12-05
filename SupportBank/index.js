const readline = require('readline-sync');
const fs = require('fs');


// Classes
class Account{
    constructor( name , transList ){
        this.name = name;
        this.balance = findBalance(name,transList);
    };
}

class Transaction{
    constructor( date , from , to , narrative , amount ){
        this.date = date;
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = amount;
    };
}


// Functions
function findBalance( name , transList ){
    let balance = 0;
    for ( let i = 0; i < transList.length; i++){
        if ( transList[i].from === name ){
            balance -= transList[i].amount;
        }
        if ( transList[i].to === name){
            balance += transList[i].amount;
        }
    }
    return balance
}


// Variables
let people = Array(1),
    accounts = Array(1);


// Read and parse data
const data = fs.readFileSync('Transactions2014.csv','utf8');
let lines = data.split('\n');
lines = lines.splice(1,lines.length-2); // Get rid of annoying lines

const numRows = lines.length;
let dates = Array( numRows - 1 ),
    froms = Array( numRows - 1 ),
    tos = Array( numRows - 1 ),
    narratives = Array( numRows - 1 ),
    amounts = Array( numRows - 1 ),
    trans = Array( numRows - 1 );


// Create transactions
for ( let i = 0; i < lines.length; i++ ){
    [ dates[i] , froms[i] , tos[i] , narratives[i] , amounts[i] ] = lines[i].split(',');
    trans[i] = new Transaction( dates[i] , froms[i] , tos[i] , narratives[i] , amounts[i] );
} // Can I cut the middle bit out?


// Create accounts
for ( let i = 0; i < trans.length; i++){ // Get list of names
    if ( people.indexOf( trans[i].from ) === -1 ){
        people = people.concat( trans[i].from );
        let newAccount = new Account( trans[i].from , trans );
        accounts = accounts.concat(newAccount);

    }
    if ( people.indexOf( trans[i].to ) === -1 ){
        people = people.concat( trans[i].to );
        let newAccount = new Account( trans[i].to , trans );
        accounts = accounts.concat(newAccount);
    }
}

console.log(accounts[5]);
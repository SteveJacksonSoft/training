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
        this.reason = narrative;
        this.amount = amount;
    };
}


// Functions
function findBalance( name , transList ){
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

function listAll(){
    for ( let i = 0; i < accounts.length; i++ ){
        console.log(accounts[i].name + ' ' + accounts[i].balance + '\n');
    }
}

function listTrans( name , transList ){
    for ( let i = 0; i < trans.length; i++ ){
        if ( transList[i].from.toLowerCase() === name.toLowerCase() || transList[i].to.toLowerCase() === name.toLowerCase() ){
            console.log( transList[i] );
        }
    }
}

function cleanArray(inputArray){
    for ( let i = 0; i <inputArray.length; i++ ){

        while ( inputArray[i] === undefined && i < inputArray.length){
            inputArray.splice(i,1);
        }

    }

    return inputArray
}

// Variables
let people = Array(1),
    accounts = Array(1);


// Read and parse data
const data = fs.readFileSync('Transactions2014.csv','utf8');
let lines = data.split('\n');
lines = lines.splice(1,lines.length-2); // Get rid of annoying lines

const numRows = lines.length;
let trans = Array( numRows - 1 );


// Create transactions
for ( let i = 0; i < lines.length; i++ ){
    const [ date , from , to , narrative , amount ] = lines[i].split(',');
    trans[i] = new Transaction( date , from , to , narrative , +amount );
}


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


// Kill first entries in people and accounts
people.splice(0,1);
accounts.splice(0,1);


// Get rid of undefineds
people = cleanArray( people );
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
        for ( let i = 0; i < people.length; i++){

            if ( command.indexOf( people[i] ) !== -1 ){
                listTrans( people[i] , trans );
                break
            }

        }
    }


}
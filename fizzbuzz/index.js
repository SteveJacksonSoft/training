const readline = require('readline-sync');

let minJ,
    bIndex,
    readOut = "",
    oldOut = "",
    rules = Array(6),
    primes = ['3','5','7','11','13','17'];

// Rules
// For multiples of 3,5,7 read terms as and when and in that order
function rule3(num , readOut){
    if ( num%3 === 0 )
        readOut += "Fizz";
    return readOut
}
function rule5(num , readOut){
    if ( num%5 === 0 )
        readOut += "Buzz";
    return readOut
}
function rule7(num , readOut){
    if ( num%7 === 0 )
        readOut += "Bang";
    return readOut
}
// For multiples of 11 read "Bong" only (unless also multiple of 13 in which case read Fezz also)
function rule11(num , readOut){
    if ( num%11 === 0 )
        readOut = "Bong";
    return readOut
}
// For multiples of 13 read Fezz before first B word
function rule13(num , readOut){
    if ( num%13 === 0 ) {
        bIndex = readOut.indexOf("B");
        if (bIndex !== -1)
            readOut = readOut.slice(0,bIndex)+ "Fezz" + readOut.slice(bIndex);
        else
            readOut += "Fezz";
    }
    return readOut
}
// For multiples of 17 reverse order of words
function rule17(num , readOut){
    if ( num%17 === 0 ){
        maxJ = readOut.length;
        oldOut = readOut;
        readOut = "";
        for (let j=0;j<=maxJ;j=j+4){
            readOut += oldOut.slice( maxJ-j , maxJ-j+4 );
        }
    }
    return readOut
}

// Input options
console.log("How far do you want to go?");
const topNum = readline.prompt();

console.log("Which rules would you like to implement? Enter a subset of { 3, 5, 7, 11, 13, 17} in brackets. Leave a space on each side of the number.");
const options = readline.prompt();
for( let i=0;i<6;i++){
    if ( options.indexOf(' ' + primes[i] + ' ') !== -1 ){
        rules[i] = true;
    }else{
        rules[i] = false;
    }
}

// Readout
for (let i=1;i<=topNum;i++){
    readOut = "";

    if (rules[0])
        readOut = rule3(i,readOut);
    if (rules[1])
        readOut = rule5(i,readOut);
    if (rules[2])
        readOut = rule7(i,readOut);
    if (rules[3])
        readOut = rule11(i,readOut);
    if (rules[4])
        readOut = rule13(i,readOut)
    if (rules[5])
        readOut = rule17(i,readOut)

    // If not multiple of any:
    if (readOut === "")
        readOut = i.toString();

    console.log(readOut);
}
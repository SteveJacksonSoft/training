const readline = require('readline-sync');

let minJ,
    bIndex,
    readOut = "",
    oldOut = "",
    rules = Array(6),
    primes = ['3','5','7','11','13','17'];

// Input options
console.log("How far do you want to go?");
const topNum = + readline.prompt();

console.log("Which rules would you like to implement? Enter a subset of {3,5,7,11,13,17}.");
const options = readline.prompt();
for( let i=0;i<6;i++){
    if ( options.indexOf(' ' + primes[i] + ' ') !== -1 ){
        rules[i] = true;
    }else{
        rules[i] = false;
    }
}

for (let i=1;i<=topNum;i++){
    readOut = "";

    // For multiples of 3,5,7 read terms as and when and in that order
    if (i%3 === 0 && rules[0])
        readOut += "Fizz";
    if (i%5 === 0 && rules[1])
        readOut += "Buzz";
    if (i%7 === 0 && rules[2])
        readOut += "Bang";

    // For multiples of 11 read "Bong" only (unless also multiple of 13)
    if (i%11 === 0 && rules[3])
        readOut = "Bong";

    // For multiples of 13 read Fezz before first B word
    if (i%13 ===0 && rules[4]) {
        bIndex = readOut.indexOf("B");
        if (bIndex !== -1)
            readOut = readOut.slice(0,bIndex)+ "Fezz" + readOut.slice(bIndex);
        else
            readOut += "Fezz";
    }

    // For multiples of 17 reverse order of words
    if (i%17===0 && rules[5]){
        minJ = -readOut.length;
        oldOut = readOut;
        readOut = "";
        for (let j=0;j>=minJ;j=j-4){
            readOut += oldOut.slice(j-4,j);
        }
    }

    // If not multiple of any:
    if (readOut === "")
        readOut = i.toString();

    console.log(readOut);
}
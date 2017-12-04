let minJ,
    bIndex,
    readOut = "",
    oldOut = "",
    isDiv = false;

for (let i=1;i<=230;i++){
    readOut = "";

    // For multiples of 3,5,7 read terms as and when and in that order
    if (i%3 === 0)
        readOut = "Fizz";
    if (i%5 === 0)
        readOut += "Buzz";
    if (i%7 === 0)
        readOut += "Bang";

    // For multiples of 11 read "Bong" only (unless also multiple of 13)
    if (i%11 === 0)
        readOut = "Bong";

    // For multiples of 13 read Fezz before first B word
    if (i%13 ===0) {
        bIndex = readOut.indexOf("B");
        if (bIndex !== -1)
            readOut = readOut.slice(0,bIndex)+ "Fezz" + readOut.slice(bIndex);
        else
            readOut += "Fezz";
    }

    // For multiples of 17 reverse order of words
    if (i%17===0){
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
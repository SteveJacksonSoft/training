let minJ,
    bIndex,
    readOut = "",
    oldOut = "",
    isDiv = false;

for (let i=1;i<=230;i++){
    readOut = "";
    if (i%3 === 0)
        readOut = "Fizz";
    if (i%5 === 0)
        readOut += "Buzz";
    if (i%7 === 0)
        readOut += "Bang";
    if (i%11 === 0)
        readOut = "Bong";
    if (i%13 ===0) {
        bIndex = readOut.indexOf("B");
        if (bIndex !== -1)
            readOut = readOut.slice(0,bIndex)+ "Fezz" + readOut.slice(bIndex);
        else
            readOut += "Fezz";
    }
    if (i%17===0){
        minJ = -readOut.length;
        oldOut = readOut;
        readOut = "";
        for (let j=0;j>=minJ;j=j-4){
            readOut += oldOut.slice(j-4,j);
        }
    }
    if (readOut === "")
        readOut = i.toString();
    console.log(readOut);
}
function cleanArray(inputArray){
    for ( let i = 0; i <inputArray.length; i++ ){

        while ( inputArray[i] === undefined && i < inputArray.length){
            inputArray.splice(i,1);
        }

    }

    return inputArray
}

let first = Array(10);
first[0] = 5;
first[5] = 'no';

console.log(first);

cleanArray(first);
console.log(first);
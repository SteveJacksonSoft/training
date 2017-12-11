class Bus {
    constructor(number, arrivalTime, destination) {
        this.number = number;
        this.arrivalTime = arrivalTime;
        this.destination = destination;
    }
}

class Stop {
    constructor(name, code, buses) {
        this.name = name;
        this.code = code;
        this.buses = buses;
    }
}

exports.Bus = Bus;
exports.Stop = Stop;
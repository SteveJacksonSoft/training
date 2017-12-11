const request = require('request');
const readline = require('readline-sync');
const log4js = require('log4js');
const logger = log4js.getLogger('index.js');

const ord = ['First' , 'Second' , 'Third' , 'Fourth' , 'Fifth'];

exports.getBuses = getBuses;
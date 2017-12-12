const log4js = require('log4js');
const logger = log4js.getLogger('index.js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const indexFunctions = require('./indexFunctions');


logger.debug('Programme started.');

indexFunctions.command();

const moment = require('moment');

const timestamp = 1702144800000;
const utcDateTime = moment.utc(timestamp).format('MM-DD-YYYY HH');

console.log(utcDateTime);
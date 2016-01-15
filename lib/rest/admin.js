var config = require('../config');
var handler = require('./responsehandler');
var request = require('superagent');

var root = '/admin';

function clearTesting(callback) {
  request
    .get(config.host+root+'/clearTesting')
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

module.exports = {
  clearTesting : clearTesting
};

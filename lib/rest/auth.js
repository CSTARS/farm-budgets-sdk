var config = require('../config');
var handler = require('./responsehandler');
var request = require('superagent');

var root = '/auth';

function getDevToken(callback) {
  request
    .get(config.host+root+'/getDevToken')
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function newDevToken(callback) {
  request
    .get(config.host+root+'/newDevToken')
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

module.exports = {
  getDevToken : getDevToken,
  newDevToken : newDevToken
};

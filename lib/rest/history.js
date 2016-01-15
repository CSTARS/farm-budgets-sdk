var config = require('../config');
var handler = require('./responsehandler');
var request = require('superagent');

var root = '/history';

function get(id, callback) {
  request
    .get(config.host+root+'/'+id)
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

module.exports = {
  get : get
};

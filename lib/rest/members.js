var config = require('../config');
var handler = require('./responsehandler');
var request = require('superagent');

var root = '/members';

function search(query, callback) {
  request
    .get(config.host+root+'/search')
    .query({q : query})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

module.exports = {
  search : search
};

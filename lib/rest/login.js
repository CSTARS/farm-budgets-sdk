var config = require('../config');
var handler = require('./responsehandler');
var request = require('superagent');

var root = '/auth';

// really this is just a call to get user info
function login(callback) {
  request
    .get(config.host+root+'/getUserInfo')
    .set('x-dev-token', config.token)
    .end(handler(function(resp){
      if( !resp.error ) {
        config.user = resp;
      }

      callback(resp);
    }));
}

module.exports = login;

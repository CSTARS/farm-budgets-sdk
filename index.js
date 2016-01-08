var rest = require('./lib/rest');
var config = require('./lib/config');

module.exports = function(conf) {
  config.host = conf.host;
  config.token = conf.token;

  var api = {};
  for( var key in rest ) {
    api[key] = rest[key];
  }

  return api;
};

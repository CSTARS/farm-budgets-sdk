var rest = require('./lib/rest');
var logic = require('./lib/logic');
var config = require('./lib/config');

module.exports = function(conf) {
  config.host = conf.host;
  config.token = conf.token;

  var api = {}, key;

  for( key in rest ) {
    api[key] = rest[key];
  }

  for( key in logic ) {
    api[key] = logic[key];
  }

  return api;
};

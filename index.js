var sdk = require('./lib');

module.exports = function(conf) {
  if( conf ) {
    sdk.config.host = conf.host;
    sdk.config.token = conf.token;
  }

  return sdk;
};

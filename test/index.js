require('./lib');


describe('Clean Up', function() {
  var sdk = require('../index')(require('/etc/farm-budgets-sdk/setup'));

  it('let you cleanup the mess', function(next){
    // login user (set user data)
    sdk.login(function(resp){
      if( resp.error ) {
        throw(Error(resp.message));
      }

      // clear old testing data
      sdk.admin.clearTesting(function(resp){
        if( resp.error ) {
          throw(Error(resp.message));
        }
        next();
      });
    });
  });
});

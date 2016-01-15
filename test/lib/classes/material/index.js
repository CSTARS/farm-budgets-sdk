var assert = require('assert');

/**
  This includes a little bit of integration testing.
**/
describe('Material Class', function() {
  var sdk = require('../../../../index')(require('/etc/farm-budgets-sdk/setup'));
  var data;

  before(function(next){
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

  beforeEach(function(){
    data = require('./data')();
  });

  it('create a empty material class', function(){
    var material = sdk.createMaterial();

    assert.equal(material.getName(), undefined);
    assert.notEqual(material.getId(), undefined);
    assert(material.getId().length > 0);
  });

  it('populate material class', function(){
    var m = data.m1;
    var material = sdk.createMaterial(m);

    assert.equal(material.getName(), m.name);
    assert.equal(material.getType(), m.type);
    assert.equal(material.getId(), m.id);
    assert.equal(material.getDescription(), m.description);
    assert.equal(material.getUnits(), m.units);
    assert.equal(material.getPrice(), m.price);
    assert.equal(material.getAuthority(), m.authority);
    assert.equal(material.getLocality().length, m.locality.length);
    for( var i = 0; i < m.locality.length; i++ ) {
      assert.equal(material.getLocality()[i], m.locality[i]);
    }
    assert.equal(material.getYear(), m.year);
    assert.equal(material.getSource(), m.source);
    assert.equal(material.getClass(), m.class);
  });

  it('throw error with bad units', function(){
    var material = sdk.createMaterial();

    try {
      material.setUnits('foo');
    } catch(e) {
      assert(e instanceof Error);
      return;
    }

    assert.equal(true, false, 'Invalid units did not throw error');
  });

  it('should save material', function(next){
    var material = sdk.createMaterial(data.m1);

    // first we need to set a test authority
    sdk.authorities.create({
      name : data.m1.authority,
      description : 'A test authority',
      testing : true
    }, function(resp){
      assert.equal(resp.error, undefined, 'Error saving authority for testing: '+resp.message);

      material.save(function(resp){
        assert.equal(resp.error, undefined, 'Error saving material: '+resp.message);
        next();
      });
    });
  });

  it('should load saved material', function(next){
    sdk.loadMaterial(data.m1.id, function(resp){
        assert.equal(resp.error, undefined, 'Error loading saved material: '+resp.message);
        assert.equal(data.m1.name, resp.getName());
        next();
    });
  });
});

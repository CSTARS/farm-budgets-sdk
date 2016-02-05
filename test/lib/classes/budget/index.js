var assert = require('assert');

/**
  This includes a little bit of integration testing.
**/
describe('Budget Class', function() {
  var sdk = require('../../../../index')(require('/etc/farm-budgets-sdk/setup'));
  var data;

  before(function(next){


    // login user (set user data)
    sdk.login(function(resp){
      if( resp.error ) {
        throw(Error(resp.message));
      }

      sdk.controllers.reset();

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

  it('create a empty budget class with newBudget()', function(){
    var budget = sdk.newBudget();

    assert.equal(budget.getName(), '', 'Name is not empty');
    assert.notEqual(budget.getId(), '', 'Id is empty');
    assert(budget.getId().length > 0, 'Id string length is not greater than 0');
  });

  it('populate budget class with setBudget()', function(){
    var b = data.b1;
    var budget = sdk.setBudget({
      budget: b,
      materials: []
    });

    assert.equal(budget.getName(), b.name);
    assert.equal(budget.getId(), b.id);
    assert.equal(budget.getAuthority(), b.authority);
    assert.equal(budget.getLocality().length, b.locality.length);
    for( var i = 0; i < b.locality.length; i++ ) {
      assert.equal(budget.getLocality()[i], b.locality[i]);
    }
    assert.equal(budget.getId(), b.id);
    assert.equal(budget.getCommodity(), b.commodity);
    assert.equal(budget.getFarm().name, b.farm.name);
    assert.equal(budget.getFarm().size, b.farm.size);
    assert.equal(budget.getFarm().units, b.farm.units);
  });

  it('populate budget class and operations with setBudget()', function(){
    var b = data.b2;
    var budget = sdk.setBudget({
      budget: b,
      materials: []
    });

    assert.equal(budget.getOperation().length, b.operations.length);
    assert.equal(budget.data.operations.length, b.operations.length);
  });

  it('let your retrieve the current budget with getBudget()', function(){
    var b = data.b2;
    var budget = sdk.getBudget();

    assert.equal(budget.getId(), b.id);
  });

  it('let you save current budget', function(next){
    var b = data.b2;
    var budget = sdk.getBudget();

    sdk.authorities.create({
      name : b.authority,
      description : 'A test authority',
      testing : true
    }, function(resp){
      budget.save(function(resp){
        assert.equal(resp.error, undefined, 'unable to save budget: '+resp.message);
        assert.equal(resp.id, b.id);
        next();
      });
    });
  });

  it('should let you load a saved budget', function(){
    var b = data.b2;
    sdk.reset();
    sdk.loadBudget(b.id, function(resp){
      assert.equal(resp.error, undefined, 'unable to load budget: '+resp.message);
      assert.equal(resp.getId(), b.id);
    });
  });

  it('should throw errors when invalid values passed to setFarm', function(){
    var budget = sdk.getBudget();

    var error = null;
    try { budget.setFarm(); }
    catch(e) { error = e; }
    assert(error instanceof Error);

    error = null;
    try { budget.setFarm('t'); }
    catch(e) { error = e; }
    assert(error instanceof Error);

    error = null;
    try { budget.setFarm('t', 't'); }
    catch(e) { error = e; }
    assert(error instanceof Error);

    error = null;
    try { budget.setFarm(1, 't', '2'); }
    catch(e) { error = e; }
    assert(error instanceof Error);

    error = null;
    try { budget.setFarm('t', '2', 'h'); }
    catch(e) { error = e; }
    assert(error instanceof Error);

    error = null;
    try { budget.setFarm('t', '2', 2); }
    catch(e) { error = e; }
    assert(error instanceof Error);

    error = null;
    try { budget.setFarm('t', 2, 'foo'); }
    catch(e) { error = e; }
    assert(error instanceof Error);
    assert.equal(error.message, 'invalid units');
  });

  it('should let you add a new material class instance', function(){
    var m = require('../material/data')().m1;
    var material = sdk.createMaterial(m);
    var budget = sdk.getBudget();

    try {
      budget.addMaterial(material);
    } catch(e) {
      assert(false, e.message);
    }

    // the add material call above should have added the material to the
    // material controller
    var data = sdk.controllers.material.get(m.name);
    assert.equal(m.id, data.id);

    // TODO: this should be causing recalc events...
    //console.log(sdk.getTotal());
  });

});

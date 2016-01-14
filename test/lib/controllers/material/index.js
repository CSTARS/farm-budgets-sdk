var assert = require('assert');

describe('Material Controller', function() {
  var controllers = require('../../../../lib/controllers');
  var data;

  beforeEach(function(){
    data = require('./data')();
  });

  it('add simple material', function(){
    var response = controllers.material.add(data.simple1);

    assert.equal(response.success, true);
    assert.equal(controllers.material.get(data.simple1.name).name, 'labor');
  });

  it('fire event on add', function(done){
    controllers.material.on('material-update', function(response){
      assert.equal(response.success, true);
      done();
    });

    // there are 2.  one bound above, one by the operation controller
    assert.equal(controllers.material.getEventsModule().listenerCount('material-update'), 2);
    controllers.material.add(data.simple2);
  });

  it('should reset', function(){
    controllers.material.reset();

    assert.equal(Object.keys(controllers.material.get()).length, 0);
    // operation controller should reattach, so one bound event
    assert.equal(controllers.material.getEventsModule().listenerCount('material-update'), 1);
  });

  it('not allow duplicate materials', function(){
    var response = controllers.material.add(data.simple1);

    assert.equal(response.success, true);

    response = controllers.material.add(data.simple1);
    assert.equal(response.error, true);
    assert.equal(response.code, 2);
  });

  it('should allow updates', function(){
    controllers.material.reset();

    controllers.material.add(data.simple1);
    assert.equal(controllers.material.get(data.simple1.name).price, 1);

    var update = require('./data')().simple1;
    update.price = 2;
    var response = controllers.material.add(update, {replace: true});

    assert.equal(response.success, true);
    assert.equal(controllers.material.get(data.simple1.name).price, 2);
  });

  it('calculate complex materials', function(){
    controllers.material.reset();

    controllers.material.add(data.simple1);
    controllers.material.add(data.simple2);

    // add complex1
    var response = controllers.material.add(data.complex1);
    assert.equal(response.success, true);

    var m = controllers.material.get(data.complex1.name);
    assert.equal(m.price, 12.25);

    // add complex 2
    response = controllers.material.add(data.complex2);
    assert.equal(response.success, true);

    m = controllers.material.get(data.complex2.name);
    // complex2 is complex1 + 4 more liters of fuel.
    // so 4 * fuel price (3.75) * gal to liter (0.264172) = 3.96258;
    // 3.96258 + 12.25 = 16.21258
    assert.equal(m.price.toFixed(5), '16.21258');
  });

  it('should complain with missing required material', function(){
    controllers.material.reset();
    controllers.material.add(data.complex1);
    var m = controllers.material.get(data.complex1.name);
    assert.equal(m.recalcErrors.length, 2);
  });

  it('should not allow cyclical complex material dependencies', function(){
    controllers.material.reset();
    controllers.material.add(data.simple1);

    controllers.material.add(data.complex3);
    controllers.material.add(data.complex4);

    assert.equal(data.complex3.recalcErrors.length, 1);
    assert.equal(data.complex4.recalcErrors.length, 1);
  });

  it('should let you fix last test cyclical errors', function(){
    var complex3 = controllers.material.get(data.complex3.name);
    var complex4 = controllers.material.get(data.complex4.name);

    // we should be able to fix these errors as well;
    delete complex3.materials[complex4.name];
    controllers.material.add(complex3, {replace: true});

    assert.equal(complex3.recalcErrors.length, 0);
    assert.equal(complex4.recalcErrors.length, 0);
    assert.equal(complex4.price, 4);
  });

  it('not fire update event with noEvent flag', function(){
    controllers.material.reset();

    controllers.material.on('material-update', function(response){
      assert.equal(true, false);
    });

    setTimeout(function(response){
      assert.equal(true, true);
      done();
    }, 100);

    controllers.material.add(data.simple1, {noEvent: true});
  });

  it('should not recalc with noRecalc flag', function(){
    controllers.material.reset();

    controllers.material.add(data.simple1);
    controllers.material.add(data.simple2);
    controllers.material.add(data.complex1);

    // test no update
    var newData = require('./data')().simple1;
    newData.price = 2;
    var resp = controllers.material.add(newData, {noRecalc: true, replace: true});
    assert.equal(resp.success, true);
    assert.equal(controllers.material.get(data.complex1.name).price, 12.25);

    // now actually update
    resp = controllers.material.add(newData,  {replace: true});
    assert.equal(resp.success, true);
    assert.equal(controllers.material.get(data.complex1.name).price, 13.25);
  });

  it('should let you remove a material', function(){
    controllers.material.reset();

    var resp = controllers.material.add(data.simple1);
    assert.equal(resp.success, true);

    resp = controllers.material.remove('foo');
    assert.equal(resp.error, true);

    resp = controllers.material.remove(data.simple1.name);
    assert.equal(resp.success, true);

    resp = controllers.material.get(data.simple1.name);
    assert.equal(resp.error, true);
  });

  it('should let you rename a material', function(){
    controllers.material.reset();

    var resp = controllers.material.add(data.simple1);
    assert.equal(resp.success, true);

    var orgName = data.simple1.name;
    var newName = data.simple1.name+' updated';
    data.simple1.name = newName;

    resp = controllers.material.add(data.simple1, {rename: orgName});
    assert.equal(resp.success, true);

    resp = controllers.material.get(newName);
    assert.equal(resp.error, undefined);

    resp = controllers.material.get(orgName);
    assert.equal(resp.error, true);
  });
});

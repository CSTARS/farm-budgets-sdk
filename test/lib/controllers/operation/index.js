var assert = require('assert');


describe('Operation Controller', function() {
  var controllers = require('../../../../lib/controllers');
  var data, materialData;

  function getMaterialData() {
    materialData = require('../material/data')();
  }

  beforeEach(function(){
    data = require('./data')();
  });

  it('can add operation', function(){
    var resp = controllers.operation.add(data.sample1);
    assert.equal(resp.success, true);

    resp = controllers.operation.get(data.sample1.name);
    assert.equal(resp.error, undefined);
  });

  it('can reset controller', function(){
    controllers.operation.reset();
    var resp = controllers.operation.add(data.sample1);
    assert.equal(resp.success, true);

    controllers.operation.reset();
    resp = controllers.operation.get(data.sample1.name);
    assert.equal(resp.error, true);
  });

  it('returns error if operation already exists', function(){
    controllers.operation.reset();
    var resp = controllers.operation.add(data.sample1);
    assert.equal(resp.success, true);

    resp = controllers.operation.add(data.sample1.name);
    assert.equal(resp.error, true);
  });

  it('can remove operation', function(){
    controllers.operation.reset();
    var resp = controllers.operation.add(data.sample1);
    assert.equal(resp.success, true);

    resp = controllers.operation.remove(data.sample1.name);
    assert.equal(resp.success, true);

    resp = controllers.operation.get(data.sample1.name);
    assert.equal(resp.error, true);
  });

  it('can replace operation', function(){
    controllers.operation.reset();
    controllers.operation.add(data.sample1);

    var newOp = require('./data')().sample1;
    newOp.units = 'foo';

    resp = controllers.operation.add(newOp, {replace: true});
    assert.equal(resp.success, true);

    var c = controllers.operation.get(data.sample1.name);
    assert.equal(c.units, 'foo');
  });

  it('can replace operation', function(){
    controllers.operation.reset();
    controllers.operation.add(data.sample1);

    var newOp = require('./data')().sample1;
    newOp.units = 'foo';

    resp = controllers.operation.add(newOp, {replace: true});
    assert.equal(resp.success, true);

    var c = controllers.operation.get(data.sample1.name);
    assert.equal(c.units, 'foo');
  });

  it('calculates simple operation total', function(){
    controllers.operation.reset();
    getMaterialData();

    controllers.material.add(materialData.simple1);
    controllers.operation.add(data.sample1);
    var op = controllers.operation.get(data.sample1.name);

    assert.equal(op.subtotal, 5);
    assert.equal(op.total, 10);
    assert.equal(controllers.operation.getCurrentTotal().total, 10);
  });

  it('does not recalc with flag', function(){
    data.sample1.schedule.splice(0, 1);
    controllers.operation.add(data.sample1, {replace: true, noRecalc: true});

    var op = controllers.operation.get(data.sample1.name);

    assert.equal(op.subtotal, undefined);
    assert.equal(op.total, undefined);
  });

  it('can manually recalc', function(){
    controllers.operation.recalc();
    var op = controllers.operation.get(data.sample1.name);

    assert.equal(op.subtotal, 5);
    assert.equal(op.total, 5);
  });

  it('fire event on add', function(done){
    controllers.operation.reset();

    controllers.operation.on('operation-update', function(response){
      assert.equal(response.success, true);
      done();
    });

    assert.equal(controllers.operation.getEventsModule().listenerCount('operation-update'), 1);
    controllers.operation.add(data.sample1);
  });

  it('fire event on total update', function(done){
    controllers.operation.reset();

    controllers.operation.on('total-update', function(response){
      assert.equal(response.total, 10);
      done();
    });

    assert.equal(controllers.operation.getEventsModule().listenerCount('total-update'), 1);
    controllers.operation.add(data.sample1);
  });

});

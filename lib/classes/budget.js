var extend = require('extend');
var verify = require('./utils').verify;
var rest = require('../rest');
var utils = require('../utils');
var units = require('../units');
var controllers = require('../controllers');
var Operation = require('./operation');
var Material = require('./material');

module.exports = function(data) {
  this.data = extend(true, {}, data);
  //this.operations = [];

  //if( !this.data.operations ) {
  //  this.data.operations = [];
  //}
  if( !this.data.id ) {
    this.data.id = utils.guid();
  }

  //for( var i = 0; i < this.data.operations.length; i++ ) {
  //  this.operations.push(new Operation(this.data.operations[i]));
  //}

  //controllers.operation.recalc();

  this.getMaterial = function(name) {
    var data = controllers.material.get(name);
    if( data.error ) {
      return data;
    }
    return new Material(data);
  };

  this.addOperation = function(name) {
    var op = new Operation({
      name: name,
      materials : [],
      schedule : [],
      units : '[acr_us]'
    });
    controllers.operation.add(op.data);
    //this.operations.push(op);
    return op;
  };

  this.removeOperation = function(name) {
    //for( var i = 0; i < this.operations.length; i++ ) {
    //  if( this.operations[i].getName() === name ) {
    //    this.operations.splice(i, 1);
    //    break;
    //  }
    //}

    controllers.operation.remove(name);
  };

  this.hasOperation = function(name) {
    return controllers.operation.exists(name);
  },

  // TODO: there should only be one operation name
  this.getOperation = function(name) {
    if( name ) {
      return new Operation(controllers.operation.get(name));
    }

    var operations = [];
    var ops = controllers.operation.get();
    for( name in ops ) {
      operations.push(new Operation(ops[name]));
    }
    return operations;
  };

  this.getFarm = function() {
    return this.data.farm;
  };
  this.setFarm = function(name, size, units) {
    if( !name ) throw(new Error('farm name required'));
    if( !size ) throw(new Error('farm size required'));
    if( !units ) throw(new Error('farm units required'));

    if( typeof name !== 'string' ) throw(new Error('farm name must be a string'));
    if( typeof size !== 'number' ) throw(new Error('size name must be a number'));
    if( typeof units !== 'string' ) throw(new Error('farm units must be a string'));

    try {
      units.ucumParse(units.cleanDollars(units));
    } catch(e) {
      throw(new Error('invalid units'));
    }

    this.data.farm = {
      name : name,
      size : size,
      units : units
    };
  };

  this.getAuthority = function() {
    return this.data.authority;
  };

  this.setAuthority = function(authority) {
    verify.authority(authority);
    this.data.authority = authority;
  };

  this.getLocality = function() {
    return this.data.locality;
  };

  this.setLocality = function(locality) {
    verify.locality(locality);
    this.data.locality = locality;
  };

  this.getName = function() {
    return this.data.name;
  };
  this.setName = function(name) {
    this.data.name = name;
  };

  this.getId = function() {
    return this.data.id;
  };

  this.setReference = function(budgetId) {
    this.data.refernce = budgetId;
  };
  this.getReference = function() {
    return this.data.reference;
  };
  this.isReference = function() {
    if( this.data.reference ) return true;
    return false;
  };

  this.isDeleted = function() {
    if( this.data.deleted ) return true;
    return false;
  };

  this.getCommodity = function() {
    return this.data.commodity;
  };
  this.setCommodity = function(commodity) {
    this.data.commodity = commodity;
  };

  this.removeMaterial = function(name) {
    controllers.material.remove(name);
  };

  this.addMaterial = function(material) {
    if( !(material instanceof Material) ) {
      throw(new Error('Object must be Material Class instance'));
    }

    if( !material.getId() ) {
      material.data.id = utils.guid();
    }

    controllers.material.add(material.data, {replace: true});
  };

  this.getData = function() {
    this.data.operations = [];
    var ops = controllers.operation.get();
    for( var name in ops ) {
      this.data.operations.push(ops[name]);
    }

    return this.data;
  };

  this.save = function(callback) {
    this.getData();
    rest.budgets.save(this.data, callback);
  };

};

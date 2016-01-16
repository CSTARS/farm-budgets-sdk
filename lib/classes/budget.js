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
  this.operations = [];

  if( !this.data.operations ) {
    this.data.operations = [];
  }
  if( !this.data.id ) {
    this.data.id = utils.guid();
  }

  for( var i = 0; i < this.data.operations.length; i++ ) {
    this.operations.push(new Operation(this.data.operations[i]));
  }

  controllers.operation.recalc();

  this.addOperation = function(name) {
    var op = new Operation({name: name});
    this.operations.push(op);
    return op;
  };

  this.getOperation = function(name) {
    if( name ) {
      var instances = [];

      for( var i = 0; i < this.operations.length; i++ ) {
        if( this.operations[i].getName() === name ) {
          instances.push(this.operations[i]);
        }
      }

      return instances;
    }

    return this.operations;
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

  this.addMaterial = function(material) {
    if( !(material instanceof Material) ) {
      throw(new Error('Object must be Material Class instance'));
    }

    if( !material.getId() ) {
      material.data.id = utils.guid();
    }

    controllers.material.add(material.data, {replace: true});
  };

  this.save = function(callback) {
    this.data.operations = [];
    this.operations.forEach(function(op) {
      this.data.operations.push(op.data);
    }.bind(this));

    rest.budgets.save(this.data, callback);
  };

};

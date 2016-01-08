var extend = require('extend');
var verify = require('./verify');
var Operation = require('./operation');
var fb = require('../shared');

module.exports = function(data) {
  this.data = extend(true, {}, data);
  this.operations = [];

  if( !this.data.operations ) {
    this.data.operations = [];
  }

  for( var i = 0; i < this.data.operations.length; i++ ) {
    this.operations.push(new Operation(this.data.operations[i]));
  }

  this.addOperation = function(name) {
    var op = new Operation({name: name});
    this.operations.push(op);
    return op;
  };

  this.getOperation = function(name) {
    if( name ) {
      for( var i = 0; i < this.operations.length; i++ ) {
        if( this.operations[i].getName() === name ) {
          return this.operations[i];
        }
      }

      return null;
    }

    return this.operations;
  };

  this.getFarm = function() {
    return this.data.farm;
  };
  this.setFarm = function(name, size, units) {
    if( !name ) throw('farm name required');
    if( !size ) throw('farm size required');
    if( !units ) throw('farm units required');

    if( typeof name !== 'string' ) throw('farm name must be a string');
    if( typeof size !== 'number' ) throw('size name must be a number');
    if( typeof units !== 'string' ) throw('farm units must be a string');

    try {
      units.ucumParse(units.cleanDollars(units));
    } catch(e) {
      throw('invalid units');
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
    if( typeof material === 'object' ) {
      if( !material.id ) throw('material given w/o id');
      material = material.id;
    }

    if( this.data.materialIds.indexOf(material) > -1 ) {
      return;
    }

    this.data.materialIds.push(material);
  };

};

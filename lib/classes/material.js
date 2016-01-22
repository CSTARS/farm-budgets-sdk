var extend = require('extend');
var units = require('../units');
var controllers = require('../controllers');
var verify = require('./utils').verify;
var guid = require('../utils').guid;
var rest = require('../rest');

module.exports = function(data) {
  this.data = {};

  if( data ) {
    this.data = extend(true, {}, data);
  }

  if( !this.data.id ) {
    this.data.id = guid();
  }

  // TODO: test
  this.getErrors = function() {
    return controllers.material.getErrors(this.data.name);
  };

  // TODO: test
  this.hasError = function() {
    return controllers.material.hasError(this.data.name);
  };

  this.getId = function() {
    return this.data.id;
  };

  this.setName = function(name) {
    this.data.name = name;
  };

  this.getName = function() {
    return this.data.name;
  };

  this.getDescription = function() {
    return this.data.description;
  };

  this.setDescription = function(description) {
    this.description = description;
  };

  this.getUnits = function() {
    return this.data.units;
  };

  this.setUnits = function(units) {
    try {
      unitUtils.ucumParse(unitUtils.cleanDollars(units));
    } catch(e) {
      throw(new Error('invalid units'));
    }

    this.data.units = units;
  };

  this.getType = function() {
    return this.data.type;
  };

  this.setType = function(type) {
    this.data.type = type;
  };

  this.getPrice = function() {
    return this.data.price;
  };

  this.setPrice = function(price) {
    this.data.price = price;
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

  this.getYear = function() {
    return this.data.year;
  };

  this.setYear = function(year) {
    this.data.year = year;
  };

  this.getSource = function() {
    return this.data.source;
  };

  this.setSource = function(source) {
    this.data.source = source;
  };

  this.getClass = function() {
    return this.data.class;
  };

  this.setClass = function(c) {
    this.data.class = c;
  };

  // TODO: test
  this.getRequiredMaterials = function() {
    return this.data.materials;
  };

  // TODO: test
  this.getUniqueMaterials = function() {
    return this.data.unique || {};
  };

  // TODO: test
  this.errorInRequiredMaterials = function() {
    for( var key in this.data.materials ) {
      if( this.data.materials[key].error ) {
        return true;
      }
    }

    return false;
  };

  // TODO: test
  this.isDeleted = function() {
    return this.data.deleted;
  };

  this.save = function(callback) {
    rest.materials.save(this.data, function(resp){
      if( !resp.error ) {
        // && this material is in the material controller, trigger update.
      }

      callback(resp);
    });
  };

};

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
    var errors = controllers.material.getErrors(this.data.name) || {errors: [], materials: {}};
    if( this.data.message ) {
      errors.errors.push(this.data.message);
    }
    return errors;
  };

  // TODO: test
  this.hasErrors = function() {
    if( this.data.error ) {
      return true;
    }
    return controllers.material.hasErrors(this.data.name);
  };

  this.exists = function() {
    if( this.data.exists === false ) return false;
    return true;
  };

  // TODO: test
  this.isFixed = function() {
    if( this.data.fixed ) return true;
    return false;
  };

  this.getId = function() {
    return this.data.id;
  };

  this.setName = function(name) {
    this.data.name = name;
  };

  this.getName = function() {
    return this.data.name || '';
  };

  this.getDescription = function() {
    return this.data.description || '';
  };

  this.setDescription = function(description) {
    this.data.description = description;
  };

  this.getUnits = function() {
    return this.data.units || '';
  };

  this.setUnits = function(u) {
    try {
      units.ucumParse(units.cleanDollars(u));
    } catch(e) {
      throw(new Error('invalid units'));
    }

    this.data.units = u;
  };

  this.getType = function() {
    return this.data.type || '';
  };

  this.setType = function(type) {
    this.data.type = type;
  };

  this.getPrice = function() {
    return this.data.price || 0;
  };

  this.setPrice = function(price) {
    this.data.price = price;
  };

  this.getAuthority = function() {
    return this.data.authority || '';
  };

  this.setAuthority = function(authority) {
    verify.authority(authority);
    this.data.authority = authority;
  };

  this.getLocality = function() {
    return this.data.locality || [];
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
    return this.data.source || '';
  };

  this.setSource = function(source) {
    this.data.source = source;
  };

  this.getClass = function() {
    return this.data.class || '';
  };

  this.setClass = function(c) {
    this.data.class = c;
  };

  // TODO: test
  this.isUnique = function() {
    if( this.data.unique ) return true;
    return false;
  };

  // TODO: test
  this.getRequiredMaterial = function(name) {
    if( !this.data.materials ) return null;
    if( !this.data.materials[name] ) return null;

    var m = $.extend(true, {}, this.data.materials[name]);
    m.name = name;

    if( this.data.unique && this.data.unique[name] ) {
      m.price = this.data.unique[material].price;
      m.unique = true;
    }

    return m;
  };

  // TODO: test
  this.removeRequiredMaterial = function(name) {
    if( this.data.unique && this.data.unique[name] ) {
      delete this.data.unique[name];
    }

    if( this.data.materials && this.data.materials[name] ) {
      delete this.data.materials[name];
    }
  };

  // TODO: test
  this.addRequiredMaterial = function(impl) {
    if( !impl ) throw(new Error('Material required'));
    if( !impl.name ) throw(new Error('Material name required'));

    if( impl.unique ) {
      if( !this.data.unique ) {
        this.data.unique = {};
      }

      this.data.unique[impl.name] = {
        price : impl.price,
        units : 'us$/'+impl.units
      };
    }

    if( !this.data.materials ) {
      this.data.materials = {};
    }

    this.data.materials[impl.name] = {
      amount : impl.amount,
      units : impl.units
    };
  };

  // TODO: test
  this.getRequiredMaterials = function() {
    return this.data.materials || {};
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

  this.save = function(update, callback) {
    if( typeof update === 'function' ) {
      callback = update;
      update = false;
    }

    rest.materials.save(this.data, function(resp){

      if( !resp.error && update ) {
        // && this material is in the material controller, trigger update.
        this.update();
      }

      callback(resp);
    }.bind(this));
  };

  this.delete = function(callback) {
    rest.materials.delete(this.data.id, function(resp){
      if( !resp.error ) {
        this.data.deleted = true;
        this.update();
      }

      callback(resp);
    }.bind(this));
  };

  this.update = function() {
    var options = {replace: true};
    var m;

    try {
      m = controllers.material.getById(this.data.id);
    } catch(e) {
      // proly not in the material controller
      return;
    }

    if( m.name !== this.data.name ) {
      options.rename = true;
    }

    controllers.material.add(this.data, options);
  };

};

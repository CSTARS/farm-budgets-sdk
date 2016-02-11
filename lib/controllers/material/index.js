'use strict';
/**
 * keeps track of materials, prices and complex materials.  mostly for client app.
 **/

var operationController = require('../operation');
var events = require('events').EventEmitter;
var extend = require('extend');
var units = require('../../units');
var alias = require('./alias');


events = new events();
events.setMaxListeners(1000);

var operationUpdateHandler;


var debug = false;
var data = {};
var errors = {};

function bind(handler) {
  operationUpdateHandler = handler;
  events.on('material-update', operationUpdateHandler);
}

function reset(softReset) {
  data = {};
  alias.reset();

  if( !softReset ) {
    events.removeAllListeners();
    if( operationUpdateHandler ) {
      events.on('material-update', operationUpdateHandler);
    }
  }
}

function remove(name, options) {
  if( !options ) {
    options = {};
  }

  if( data[name] ) {
    delete data[name];

    var e = {
      material : name,
      success : true
    };

    if( !options.noRecalc ) {
      recalc();
    }

    if( !options.noEvent ) {
      events.emit('material-removed', e);

      // fire update events on all materials using this material
      for( var key in data ) {
        if( !data[key].materials ) {
          continue;
        }

        e = {
          material : data[key],
          isNew : false,
          replaced : false,
          success : true
        };

        if( data[key].materials[name] ) {
          events.emit('material-update', e);
        }
      }

      operationController.recalc();
    }

    return e;
  }

  throw(new Error('material does not exist'));
}

function add(material, options) {
  if( !options ) {
    options = {};
  }

  if( data[material.name] && !options.replace ) {
    throw(new Error('material already exists'));
  }

  var isNew = false;
  if( !data[material.name] ) {
    isNew = true;
  }

  if( !material.type ) {
    if( material.materials ) {
      material.type = 'complex';
    } else {
      material.type = 'simple';
    }
  }

  data[material.name] = material;

  if( options.rename ) {
    remove(options.rename, {noRecalc: true});
  }

  if( !options.noRecalc ) {
    recalc();
  }

  var response = {
    material : material,
    isNew : isNew,
    replaced : options.rename,
    flag : options.flag, // let the caller pass it's own flags
    success : true
  };

  if( !options.noEvent ) {
    events.emit('material-update', response);
  }

  return response;
}

function exists(name) {
  if( data[name] ) return true;
  if( alias.has(name) && data[alias.get(name)] ) {
    return true;
  }
  return false;
}

function get(name) {
  if( name === undefined ) {
    return data;
  }

  if( data[name] ) {
    return data[name];
  }

  // create and alias material from the original
  if( alias.has(name) && data[alias.get(name)]) {
    var m = extend(true, {}, data[alias.get(name)]);
    m.name = name;
    m.id = ''; // make sure we don't accidently save
    m.alias = alias.get(name);
    return m;
  }

  throw(new Error('Material is not in budget'));
}

function getById(id) {
  for( var key in data ) {
    if( data[key].id === id ) {
      return data[key];
    }
  }

  throw(new Error('Material id is not in budget'));
}

function asArray() {
  var arr = [], key;
  for( key in data ) {
    arr.push(data[key]);
  }
  return arr;
}


function find(txt, ignore) {
  var re = new RegExp('.*'+txt+'.*', 'i');
  var results = [], key;

  for( key in data ) {
    if( key.match(re) && key !== ignore ) {
      results.push(data[key]);
    }
  }

  for( var i = 0; i < results.length; i++ ) {
    if( results[i].name === txt ) {
      var m = results.splice(i, 1)[0];
      results.splice(0,0,m);
      break;
    }
  }

  return results;
}

function verifyMaterial(material) {
  var error = {
    errors : []
  };

  if( material.type === 'complex' ) {
    error.materials = {};
  }

  // check price
  if( material.type === 'simple' && typeof material.price !== 'number' ) {
    error.errors.push('invalid price');
  }

  // check units
  if( typeof material.units !== 'string' ) {
    error.errors.push('no units provided');
  } else {
    try {
      units.ucumParse(units.cleanDollars(material.units));
    } catch(e) {
      error.errors.push('invalid units');
    }
  }

  // check deleted
  if( material.deleted ) {
    error.errors.push('material is deleted');
  }

  if( error.errors.length > 0 ) {
    errors[material.name] = error;
  }

  return error;
}

function verifyMaterialImplmentation(name, impl, error) {
  var e = [];

  // check amount
  if( typeof impl.amount !== 'number' ) {
    e.push('invalid amount provided');
  }

  // check units
  if( typeof impl.units !== 'string' ) {
    e.push('no units provided');
  } else {
    try {
      units.ucumParse(units.cleanDollars(impl.units));
    } catch(ex) {
      e.push('invalid units');
    }
  }

  if( e.length > 0 ) {
    error.materials[name] = e;
  }

  return e;
}

function setImplError(error, materialName, message) {
  if( !error.materials[materialName] ) {
    error.materials[materialName] = [];
  }
  error.materials[materialName].push(message);
}

// recalc all complex material costs
function recalc() {
  var t = new Date().getTime();
  errors = {};

  var materialName, material;
  for( materialName in data ) {
    if( data[materialName].type !== 'complex' ) {
      // if simple material, check for errors, otherwise continue
      verifyMaterial(data[materialName]);
      continue;
    }

    // nullify all prices for complex materials, we need to recalc
    data[materialName].price = null;
  }

  for( materialName in data ) {
    material = data[materialName];

    // now we are going to actuall recalc prices.  base materials should already
    // be set
    if( material.type !== 'complex' ) {
      continue;
    }

    // calculating a complex material might have recursively calculated this
    // materials price.  if that's the case, we can just continue.  nothing
    // to do here.  move along.
    if( material.price !== null ) {
        continue;
    }

    material.price = _recalc(material, [materialName]);
  }

  if( debug ) {
    console.log('Complex Material Recalc: '+(new Date().getTime() - t)+'ms');
  }
}

function _recalc(material, materialChain){
  var price = 0, required, impl;

  var error = verifyMaterial(material);

  // complex material prices are just a sum of their children
  for( var materialName in material.materials ) {

    // check the unique list
    if( material.unique && material.unique[materialName] ) {
      required = {
        name : materialName,
        price : material.unique[materialName].price,
        units : material.unique[materialName].units
      };
    } else {
      // otherwise use this module to get a material
      try {
        required = get(materialName);
      } catch(e) {
        // the required material is not in the budget, nothing more to do here
        error.materials[materialName] = [e.message];
        continue;
      }
    }

    // we call the required materials object a 'implmentation' of a material.
    // thus, the variable impl.
    impl = material.materials[materialName];

    // check the material implmentation for errors
    verifyMaterialImplmentation(materialName, impl, error);

    // if the required material is complex and a price has not been calcuted
    if( required.type === 'complex' && required.price === null ) {

      // make sure no recursion
      if( materialChain.indexOf(materialName) !== -1 ) {
        setImplError(error, materialName, 'Recusive materials found, ignoring');
        // nothing more to do with this material.
        required.price = 0;
        continue;
      }

      required.price = _recalc(required, extendChain(materialChain, materialName));

      // finally, check for child errors
      for( var child in required.materials ) {
        if( hasErrors(child) ) {
          setImplError(error, materialName, 'Required material has errors');
          break;
        }
      }
    }

    // now actually calculate value
    try {
      impl.price = calculateComplexPrice(required, impl);
    } catch(e) {
      impl.price = 0;
      setImplError(error, materialName, e.message);
    }


    price += impl.price;
  }

  if( error.errors.length > 0 || Object.keys(error.materials).length > 0 ) {
    errors[material.name] = error;
  }

  return price;
}

function extendChain(chain, m) {
  var newChain = chain.slice();
  newChain.push(m);
  return newChain;
}

/* think this could be bad.  should always do full recalcs
function materialRecalc(material) {
  if( typeof material !== 'object' ) {
    return;
  } else if( material.type !== 'complex' ) {
    return;
  }

  material.price = _recalc(material);
}
*/

function getErrors(material) {
  if( !material ) {
    return errors;
  }

  if( errors[material] ) {
    return errors[material];
  }

  var m;
  try {
    m = get(material);
  } catch(e) {
    return {
      errors : ['Material doesn\'t exist']
    };
  }

  var childErrors = {};
  if( m.type === 'complex' && m.materials ) {
    for( var key in m.materials ) {
      if( m.unique && m.unique[key] ) {
        continue; // TODO: how do we show unique errors?  is this an issue?
      } else if( !exists(key) ) {
        childErrors[key] = ['Material is not in budget'];
      } else if( hasErrors(key) ) {
        childErrors[key] = ['Has errors'];
      }
    }
  }

  if( Object.keys(childErrors).length > 0 ) {
    return {
      errors: [],
      materials : childErrors
    };
  }

  return null;
}

function hasErrors(material, isUnique) {
  if( errors[material] ) {
    return true;
  }

  if( isUnique ) {
    return false;
  }

  try {
    var m = get(material);

    if( m.type === 'complex' && m.materials ) {
      for( var key in m.materials ) {
        if( hasErrors(key, (m.unique && m.unique[key] ? true : false)) ) {
          return true;
        }
      }
    }

  } catch(e) {
    return true; // doesn't exist
  }

  return false;
}

// does a material contain or have a dependency on a given material name
function contains(material, name, replaced) {
  if( material.name === name || material.name === replaced ) {
    return true;
  }

  if( material.type !== 'complex' || material.materials === undefined ) {
    return false;
  }

  for( var key in material.materials ) {
    if( key === name || key === replaced ) {
      return true;
    }

    var m;
    try {
      m = get(key);
    } catch(e) {
      continue; // ignore
    }

    var childContains = contains(m, name, replaced);
    if( childContains ) {
      return true;
    }
  }

  return false;
}

// convert units for complex materials
function calculateComplexPrice(material, impl) {

  var resp = units.conversionDiff(material.units, impl.units);

  if( resp.error ) {
    throw new Error(resp.message);
  }

  impl.conversion = resp.value;

  return material.price * resp.value * impl.amount;
}


function setAliases(aliases) {
  alias.set(aliases);
}

function removeAlias(aliasName) {
  alias.remove(aliasName);

  recalc();

  events.emit('material-removed', {
    material : {
      name : aliasName
    },
    isNew : false,
    replaced : false,
    flag : {
      alias : true
    },
    success : true
  });
}

function addAlias(aliasName, material) {
  alias.add(aliasName, material);

  recalc();

  events.emit('material-update', {
    material : get(aliasName),
    isNew : false,
    replaced : false,
    flag : {
      alias : true
    },
    success : true
  });
}

function getAlias(aliasName) {
  return alias.get(aliasName);
}

function hasAlias(aliasName) {
  return alias.has(aliasName);
}

module.exports = {
  // add a material
  debug : function(d){
    debug = d;
  },
  add : add,
  get : get,
  exists : exists,
  asArray : asArray,
  remove : remove,
  find : find,
  getErrors : getErrors,
  hasErrors : hasErrors,
  on : function(event, listener){
    events.on(event, listener);
  },
  removeListener : function(event, listener){
    events.removeListener(event, listener);
  },
  // mostly for unit testing
  getEventsModule : function() {
    return events;
  },
  calculateComplexPrice : calculateComplexPrice,
  verifyMaterialImplmentation : verifyMaterialImplmentation,
  getById : getById,
  recalc : recalc,
  contains : contains,
  reset : reset,
  setAliases : setAliases,
  removeAlias : removeAlias,
  addAlias : addAlias,
  getAlias : getAlias,
  hasAlias : hasAlias,
  _bind : bind,
};

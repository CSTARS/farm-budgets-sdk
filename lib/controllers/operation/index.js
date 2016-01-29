'use strict';
/**
 * keeps track of materials, prices and complex materials.  mostly for client app.
 **/
var uuid = require('node-uuid');
var units = require('../../units');
var utils = require('./utils');
var events = require('events').EventEmitter;
events = new events();
events.setMaxListeners(1000);

var debug = false;
var total = 0;
var farmSize = 1;
var currentTotal = null;
var materialController;

var data = {};
var errors = {};

function init(controller) {
  materialController = controller;
  materialController._bind(handleMaterialUpdates);
  utils.init(this);
}

function reset(softReset) {
  total = 0;
  farmSize = 1;
  currentTotal = null;
  data = {};

  if( !softReset ) {
    events.removeAllListeners();
  }
}

function remove(name) {
  var op;

  if( typeof name === 'object' ) {
    name = name.name;
  }

  if( data[name] ) {
    delete data[name];
    recalc();
    fireUpdate('operation-removed', {operation: op});
    return;
  }

  throw(new Error('Operation does not exist'));
}

function add(operation, options) {
  if( !options ) {
    options = {};
  }

  if( !options.replace && data[operation.name] ) {
    throw(new Error('operation already exists'));
  }

  if( !operation.materials ) {
    operation.materials = [];
  }

  var isNew = data[operation.name] ? true : false;
  data[operation.name] = operation;

  if( options.rename ) {
    try {
      remove(options.rename);
    } catch(e) {
      // silently fail..
    }
  }

  if( !options.noRecalc ) {
    recalc();
  }

  var response = {
    operation : operation,
    isNew : isNew,
    replaced : options.rename,
    flag : options.flag, // let the caller pass it's own flags
    success : true,
    from : 'operation-add'
  };


  if( !options.noEvent ) {
    fireUpdate('operation-update', response);
  }

  return response;
}

function get(name) {
  if( !name ) {
    return data;
  }

  if( !data[name] ) {
    throw(new Error('Unknown operation name'));
  }

  return data[name];
}

function find(txt, ignore) {
  var re = new RegExp('.*'+txt+'.*', 'i');
  var results = [], key;

  for( var i = 0; i < data.length; i++ ) {
    if( data[i].name.match(re) && data[i].name !== ignore ) {
      results.push(data[i]);
    }
  }

  return results;
}

// recalc all complex material costs
function recalc() {
  var t = new Date().getTime();

  var operation;
  errors = {};
  total = 0;

  var range = {
    start : null,
    stop : null,
    all : []
  };

  for( var operationName in data ) {
    operation = data[operationName];

    operationRecalc(operation);

    var scheduled = operation.schedule ? operation.schedule.length : 0;

    if( operation.schedule ) {
      updateScheduleRange(operation.schedule, range, operation.name);
    }

    operation.total = scheduled * operation.subtotal;
    total += operation.total;
  }

  var spendingByMonth = utils.calculatePerMonth(range);

  if( debug ) {
    console.log('Operation Recalc: '+(new Date().getTime() - t)+'ms');
  }

  currentTotal = {
    total : total,
    range : range,
    spendingByMonth : spendingByMonth
  };

  fireUpdate('total-update', currentTotal);
}

function operationRecalc(operation) {
  var material, i, impl, errorArray, opTotal = 0;

  var error = {
    errors : [], // currently this will not store anything... one day maybe?
    materials : {} // you will access these by index
  };

  for( i = 0; i < operation.materials.length; i++ ) {
    operation.materials[i].price = null;
  }

  for( i = 0; i < operation.materials.length; i++ ) {
    impl = operation.materials[i];

    try {
      material = materialController.get(impl.name);
    } catch(e) {
      error.materials[i] = [e.message];
      continue;
    }

    errorArray = materialController.verifyMaterialImplmentation(i, impl, error);

    if( materialController.hasErrors(impl.name) ) {
      addImplError(error, i, errorArray, 'Has child errors');
      continue;
    }

    if( material.deleted ) {
      addImplError(error, i, errorArray, 'Using material has been deleted');
    }

    try {
      impl.price = materialController.calculateComplexPrice(material, impl);
    } catch(e) {
      addImplError(error, i, errorArray, e.message);
      continue;
    }


    // did something bad happen in price calculation?
    if( isNaN(impl.price) ) {
      addImplError(error, i, errorArray, 'Price calculated to NaN.  Material not included in total.');
      continue;
    }

    opTotal += impl.price;
  }

  if( error.errors.length > 0 || Object.keys(error.materials).length > 0 ) {
    errors[operation.name] = error;
  }

  operation.subtotal = opTotal;
}

function addImplError(error, name, array, msg) {
  array.push(msg);
  error.materials[name] = array;
}


function updateScheduleRange(schedule, range, name) {
  var parts, date;
  schedule.forEach(function(d){
    parts = d.date.split('-');
    date = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));

    var interval = {
      date : date,
      length : d.length,
      units : d.units,
      name : name
    };

    range.all.push(interval);

    if( range.start === null ) {
      range.start = date;
    } else if( range.start.getTime() > date.getTime() ) {
      range.start = date;
    }

    var end = getStopDate(interval);
    if( range.stop === null ) {
      range.stop = end;
    } else if( range.stop.getTime() < end.getTime() ) {
      range.stop = end;
    }
  });
}

function getStopDate(interval) {
  var l = parseInt(interval.length);

  if( interval.units === 'year' ) {
    l = l * 86400000 * 365;
  } else if( interval.units === 'day' ) {
    l = l * 86400000;
  } else {
    l = l * 86400000 * 30;
  }

  return new Date(interval.date.getTime()+l);
}

function handleMaterialUpdates(e) {
  var material = e.material;
  var replaced = e.replaced;

  recalc();

  for( var i = 0; i < data.length; i++ ) {
    var operation = data[i];
    var fireChange = false;

    for( var j = 0; j < operation.materials.length; j++ ) {
      var materialImpl = operation.materials[j];

      // update any renames
      if( materialImpl.name === replaced ) {
        materialImpl.name = material.name;
        fireChange = true;

      // look to see if this operation has the updated material
      // recursively check complex elements
      } else if( materialController.contains(materialImpl, material.name, replaced) ) {
          fireChange = true;
      }

      if( fireChange ) {
        fireUpdate('operation-update', {
          operation: operation,
          from : 'material-update'
        });
        break;
      }
    }
  }
}

function setFarmSize(size) {
  farmSize = size;
}

function getCurrentTotal() {
  return currentTotal;
}

// fire event and general update event
function fireUpdate(e, details) {
  if( e ) {
    events.emit(e,details);
  }

  events.emit('update');
}

function getErrors(operation) {
  if( errors[operation] ) {
    return errors[operation];
  }
  return null;
}

function hasErrors(operation) {
  if( errors[operation] ) {
    return true;
  }

  try {
    var op = get(operation);

    if( op.materials ) {
      for( var i = 0; i < op.materials.length; i++ ) {
        if( materialController.hasErrors(op.materials[i].name) ) {
          return true;
        }
      }
    }

  } catch(e) {
    return true; // doesn't exist
  }

  return false;
}

module.exports = {
  add : add,
  get : get,
  remove : remove,
  find : find,
  on : function(event, listener){
    events.on(event, listener);
  },
  removeListener : function(event, listener){
    events.removeListener(event, listener);
  },
  recalc : recalc,
  init : init,
  hasErrors : hasErrors,
  getErrors : getErrors,
  replaceMaterial : utils.replaceMaterial,
  setFarmSize : setFarmSize,
  getCurrentTotal : getCurrentTotal,
  reset : reset,
  fireUpdate : fireUpdate,
  // mostly for unit testing
  getEventsModule : function() {
    return events;
  },
  debug : function(mode) {
    debug = mode;
  }
};

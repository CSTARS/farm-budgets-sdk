'use strict';

var rest = require('./rest');
var controllers = require('./controllers');
var utils = require('./utils');
var units = require('./units');
var changes = require('./changes');
var config = require('./config');
var schema = require('./schema');

var Budget = require('./classes/budget');
var Material = require('./classes/material');

var currentData = {};
var budget;

function load(id, callback) {
   rest.budgets.get(id, function(resp){
     if( resp.error ) {
       return callback(resp);
     }

     controllers.set(resp); // setup the operation and material controllers

     // create and return the helper budget class
     budget = new Budget(resp.budget);
     callback(budget);
   });
}

function loadMaterial(id, callback) {
   rest.materials.get(id, function(resp){
     if( resp.error ) {
       return callback(resp);
     }

     // create and return the helper budget class
     var material = new Material(resp);
     callback(material);
   });
}

function me() {
  return config.user;
}

function getTotal() {
  return controllers.operation.getCurrentTotal();
}

function reset() {
  var newData = {
    budget : {
      id : utils.guid(),
      authority : config.user ? config.user.email : '',
      locality : [],
      name : '',
      commodity : '',
      farm : {
        name : '',
        units : '[acr_us]',
        size : 1
      },
      operations : [],
    },
    materials : []
  };

  changes.setOriginal(newData.budget, newData.materials);
  controllers.set(newData);

  budget = new Budget(newData);

  return budget;
}

function createMaterial(data) {
  return new Material(data);
}


var api = {
  utils : utils,
  controllers : controllers,
  units : units,
  changes : changes,
  schema : schema,
  config : config,
  getBudget : function() {
    if( !currentData.budget ) {
      return {};
    }
    currentData.budget.operations = controllers.operation.get();
    return currentData.budget;
  },
  createMaterial : createMaterial,
  reset : reset,
  load : load,
  loadMaterial : loadMaterial,
  me : me,
  getTotal : getTotal
};

// expose rest helpers
for( var key in rest ) {
  api[key] = rest[key];
}


module.exports = api;

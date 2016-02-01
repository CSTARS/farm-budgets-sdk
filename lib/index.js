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

var budget;

function loadBudget(id, callback) {
   rest.budgets.get(id, function(resp){
     if( resp.error ) {
       return callback(resp);
     }

     controllers.addFixedMaterials();

     setBudget(resp);
     callback(budget);
   });
}

function setBudget(data) {
  controllers.set(data); // setup the operation and material controllers
  controllers.addFixedMaterials();

  // create and return the helper budget class
  budget = new Budget(data.budget);
  return budget;
}

function getMaterial(name) {
  var data;

  try {
    data = controllers.material.get(name);
  } catch(e) {
    data = {
      error : true,
      name : name,
      exists : false,
      message : e.message
    };
  }

  return new Material(data);
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

  controllers.addFixedMaterials();
  controllers.set(newData);


  budget = new Budget(newData);

  return budget;
}

function createMaterial(data) {
  return new Material(data);
}

function newBudget() {
  var budget = reset();
  controllers.addFixedMaterials();
  return budget;
}

var api = {
  utils : utils,
  controllers : controllers,
  units : units,
  changes : changes,
  schema : schema,
  config : config,
  newBudget : newBudget,
  getBudget : function() {
    return budget;
  },
  setBudget : setBudget,
  createMaterial : createMaterial,
  reset : reset,
  loadBudget : loadBudget,
  loadMaterial : loadMaterial,
  getMaterial : getMaterial,
  me : me,
  getTotal : getTotal,
  Budget : Budget,
  Material : Material
};

// expose rest helpers
for( var key in rest ) {
  api[key] = rest[key];
}


module.exports = api;

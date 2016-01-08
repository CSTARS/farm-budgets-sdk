var fb = require('../shared');
var config = require('../config');
var rest = require('../rest');
var Budget = require('./budget');


var budget;

function load(id, callback) {
   rest.budgets.get(id, function(resp){
     if( resp.error ) {
       return callback(resp);
     }

     set(resp); // setup the operation and material controllers

     // create and return the helper budget class
     budget = new Budget(resp.budget);
     callback(budget);
   });
}

function set(data) {
  fb.reset(true);

  if( !data.budget.materials ) {
    data.budget.materials = [];
  }
  if( !data.budget.operations ) {
    data.budget.operations = [];
  }

  fb.load(data);
}

function me() {
  return config.user;
}

function getTotal() {
  return fb.operationController.getCurrentTotal();
}

function reset() {
  var newData = {
    budget : {
      id : fb.utils.guid(),
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

  fb.changes.setOriginal(newData.budget, newData.materials);
  set(newData);

  budget = new Budget(newData);

  return budget;
}

module.exports = {
  set : set,
  reset : reset,
  load : load,
  me : me,
  getTotal : getTotal
};

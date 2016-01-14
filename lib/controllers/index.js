var material = require('./material');
var operation = require('./operation');

operation.init(material);
var currentData = {};

/**
  Expects to rest payload looking like:
  data = {
    budget : {},
    materials : []
  }
**/
function load(data) {
  // by default adding/updating materials fires events and recalcs
  // budget.  We don't want to do this on initial load
  var options = {
    noEvent : true,
    noRecalc : true
  };

  data.materials.forEach(function(m){
    material.add(m, options);
  });

  material.recalc();

  operation.setFarmSize((data.budget.farm && data.budget.farm.size) ? parseInt(data.budget.farm.size) : 1);
  data.budget.operations.forEach(function(op){
    operation.add(op, options);
  });

  operation.recalc();

  currentData = data;
}

function set(data) {
  reset();

  if( !data.budget.materials ) {
    data.budget.materials = [];
  }
  if( !data.budget.operations ) {
    data.budget.operations = [];
  }

  load(data);
}

function reset() {
  operation.reset();
  material.reset();

  // tmp for now
  var fixed = ['Estimate', 'Taxes','Insurance','Capitol Cost Recover','Lube & Repairs'];
  for( var i = 0; i < fixed.length; i++ ) {
    material.add({
      name : fixed[i],
      price : 1,
      units : 'us$',
      fixed : true,
      description : 'Provide fixed cost for complex material'
    },{
      noEvent : true,
      noRecalc : true
    });
  }
}

var api = {
  material : material,
  operation : operation,
  load : load,
  set : set,
  reset : reset
};

module.exports = api;

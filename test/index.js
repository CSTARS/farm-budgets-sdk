var sdk = require('../index')(require('/etc/farm-budgets-sdk/setup.json'));

sdk.login(function(resp){
  console.log('Hello, '+sdk.me().display_name);

  sdk.budgets.search({}, function(resp){
    console.log('Loading: '+resp.results[0].id+' '+resp.results[0].name);
    sdk.load(resp.results[0].id, onBudgetLoad);
  });
});

function onBudgetLoad(budget) {
  console.log(budget.getName());
  console.log(sdk.getTotal());

  // now add a new material to budget
  var m = {
    type : 'simple',
    name : 'labor',
    location : 'California',
    authority : 'AHB',
    price : 7.5,
    units : 'h'
  };
  budget.addMaterial(m);

  // now let's add the material to our operation
  var op = budget.getOperation()[0];

  // adding 3 hours of labor
  op.addRequiredMaterial(m.name, 3, 'h');
  console.log(sdk.getTotal());


  // now add another date for operation;
  op.schedule('2018-06-06', 1, 'month');
  console.log(sdk.getTotal());
}

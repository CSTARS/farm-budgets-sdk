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
}

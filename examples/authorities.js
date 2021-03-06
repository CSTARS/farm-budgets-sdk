sdk.authorities.list(function(resp){
     console.log(resp);
});

sdk.authorities.get('AHB', function(resp){
     console.log(resp);
});

/*
  var authority = {
    name: 'API Test',
    description: 'Testing API',
  };
  sdk.authorities.create(authority, function(resp){
       console.log(resp);
  });
*/


sdk.authorities.grantAccess('API Test','jrmerz@ucdavis.edu', function(resp){
  console.log('grantAccess');
  console.log(resp);

  sdk.authorities.get('API Test', function(resp){
       console.log(resp);

       sdk.authorities.removeAccess('API Test','jrmerz@ucdavis.edu', function(resp){
         console.log('removeAccess');
         console.log(resp);

         sdk.authorities.get('API Test', function(resp){
              console.log(resp);
          });
       });
  });
});

sdk.materials.search({}, function(resp){
  console.log(resp);
});

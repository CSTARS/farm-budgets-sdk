module.exports = function() {
return {

  b1 : {
    name : 'test budget',
    id : 'b-12345-test',
    testing : true,
    authority : 'test',
    locality : ['davis', 'california'],
    commodity : 'grass',
    farm : {
      name : 'test farm',
      size : '1',
      units : '[acr_us]'
    }
  },

  b2 : {
    name : 'test budget 2',
    id : 'b-123456-test',
    testing : true,
    authority : 'test',
    locality : ['davis', 'california'],
    commodity : 'grass',
    farm : {
      name : 'test farm',
      size : '1',
      units : '[acr_us]'
    },
    operations : [
      {
        name : 'test operation - planting',
        units : '[acr_us]',
        schedule : [{
          date : '2016-04-01',
          length : '2',
          unit : 'month'
        }],
        materials : [{
          amount : 2,
          name : 'labor',
          note : 'this is a test labor implementation',
          units : 'h'
        }]
      }
    ]
  }

};
};

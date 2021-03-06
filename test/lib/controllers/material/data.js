module.exports = function() {
  return {

simple1 : {
  name : 'labor',
  price : 1,
  units : 'us$/h'
},

simple2 : {
  name : 'fuel',
  price : 3.75,
  units : 'us$/[gal_us]'
},

complex1 : {
  name : 'truck',
  units : 'us$/h',
  materials : {
    labor : {
      amount : 1,
      units : 'h'
    },
    fuel : {
      amount : 3,
      units : '[gal_us]'
    }
  }
},

complex2 : {
  name : 'truck and trailer',
  units : 'us$/h',
  materials : {
    truck : {
      amount : 1,
      units : 'h'
    },
    fuel : {
      amount : 4,
      units : 'L'
    }
  }
},

complex3 : {
  name : 'cycle badness',
  units : 'us$/h',
  materials : {
    'labor' : {
      amount : 4,
      units : 'h'
    },
    'cycle badness2' : {
      amount : 4,
      units : 'h'
    }
  }
},

complex4 : {
  name : 'cycle badness2',
  units : 'us$/h',
  materials : {
    'cycle badness' : {
      amount : 1,
      units : 'h'
    }
  }
}


  }
}

'use strict';

var definitions = require('./definitions');
var ucum = require('ucum.js');
var extend = require('extend');
var cleanDollars = require('./cleanDollars');

// cache for standard ucum calculations
// these can happen a lot a really slowdown the ur;
var ucumCache = {};
var convertCache = {};
// unit lookup hash
var lookup = {};

for( var type in definitions ) {
  var array = definitions[type];

  for( var i = 0; i < array.length; i++ ) {
    array[i].type = type;

    lookup[array[i].name] = array[i];
    if( array[i].symbol ) {
      lookup[array[i].symbol] = array[i];
    }
    if( array[i].accepted ) {
      for( var j = 0; j < array[i].accepted.length; j++ ) {
        lookup[array[i].accepted[j]] = array[i];
      }
    }
  }
}

// get label for name.  mostly for getting us$ as $ or [us_gal] as gallon.
function getLabel(name, short) {
  var parts, label;

  if( name === undefined ) {
    return '';
  }

  if( name.indexOf('/') > -1 ) {
    parts = name.split('/');

    label = [];
    parts.forEach(function(p){
      label.push(getLabel(p, short));
    });

    return label.join('/');
  }

  if( name.indexOf('.') > -1 ) {
    parts = name.split('.');

    label = [];
    parts.forEach(function(p){
      label.push(getLabel(p, short));
    });

    return label.join('*');
  }

  var txt = name.toLowerCase();
  if( lookup[txt] ) {
    if( short ) {
      return lookup[txt].accepted ? lookup[txt].accepted[0] : lookup[txt].symbol;
    }
    return lookup[txt].name;
  }
  return name;
}

// get units of same type
function getLikeUnits(name) {
  var txt = name.toLowerCase();
  if( !lookup[txt] ) {
    return [];
  }

  return definitions[lookup[txt].type];
}

function removeDollars(units) {
  return cleanDollars(units, true);
}

function invertAndRemoveDollars(units) {
  if( !units ) return '';
  return invert(cleanDollars(units)).replace(/1/g, '');
}

function invert(units) {
  units = cleanDollars(units);

  units = units.split('/');
  units = '('+units.join(')/(')+')';

  var result;
  try {
    result = ucumParse('1/('+units+')');
  } catch(e) {
    return units;
  }

  var d = [], n = [];
  for( var key in result.units ) {
    if( result.units[key] === -1 ) {
      d.push(key);
    } else {
      n.push(key);
    }
  }

  if( result.value > 1 ) {
    n.push(result.value);
  } else if ( result.value < 0 ) {
    d.push(1 / result.value);
  }

  units = n.join('.');

  if( units === '' ) {
    units = 'us$';
  }
  if( d.length > 0 ) {
    units += '/'+d.join('.');
  }

  return units;
}

function isDollar(value) {
  value = value.trim().toLowerCase();
  if( value === 'us$' || value === '$' || value === '1' || value === '' ) {
    return true;
  }
  return false;
}

function conversionDiff(from, to) {
  var value, diff;

  var unitsFrom = cleanDollars(from.trim());
  unitsFrom = unitsFrom.replace(/^1\//g, '');
  var unitsTo = cleanDollars(to.trim());

  try {
    if( convertCache[unitsFrom+'-'+unitsTo] !== undefined ) {
      diff = convertCache[unitsFrom+'-'+unitsTo];
    } else if( unitsFrom === unitsTo ) {
      diff = 1;
    } else {
      // transfer from what they game us to what we have
      diff = ucum.convert(1, unitsTo, unitsFrom);
      convertCache[unitsFrom+'-'+unitsTo] = diff;
    }

  } catch(e) {
    return {
      error: true,
      ucumError : e,
      message : 'Cannot convert units: '+unitsFrom+' to '+unitsTo
    };
  }

  var resp = {
    success : true,
    message : 'converted units: '+unitsFrom+' to '+unitsTo,
    value : diff
  };

  return resp;
}


function convertUnits(u1, u2) {
  var time = new Date().getTime();
  try {
    var t1 = cleanDollars(u1);
    var t2 = cleanDollars(u2);

    // try and see if we can fake it
    if( t2 === '1/'+t1 || t2 === '1/('+t1+')' || t1 === '1/'+t2 || t1 === '1/('+t2+')' || (t1 === '' && t2 === '') ) {
      return {
        value : 1,
        units : {},
        simple : true,
        debug : '('+t1+').('+t2+')'
      };
    }

    // we all blank units as dollars
    if( t1 === '' ) {
      t1 = 1;
    }
    if( t2 === '' ) {
      t2 = 1;
    }

    var tmp = '('+t1+').('+t2+')';
    //var t = ucum.canonicalize(tmp);
    var t = ucumParse(tmp);
    t.debug = tmp;
    return t;
  } catch(e) {
    return {
      error : true,
      message : 'Unable to convert units',
      math : u1+' * '+u2,
      debug : '('+cleanDollars(u1)+').('+ cleanDollars(u2)+')'
    };
  }
}


function ucumParse(value) {
  if( ucumCache[value] ) {
    return extend(true, {}, ucumCache[value]);
  }
  var response = ucum.parse(value);
  ucumCache[value] = extend(true, {}, response);
  return response;
}

module.exports = {
  invert : invert,
  convertUnits : convertUnits,
  conversionDiff : conversionDiff,
  getLabel : getLabel,
  getLikeUnits : getLikeUnits,
  lookup : lookup,
  ucumParse : ucumParse,
  cleanDollars : cleanDollars,
  removeDollars : removeDollars,
  invertAndRemoveDollars : invertAndRemoveDollars,
  ucum : ucum
};

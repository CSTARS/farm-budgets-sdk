'use strict';

module.exports = function(units, remove) {
  if( units === undefined ) {
    return '1';
  }
  return units.replace(/(us)?\$/g, remove ? '' : '1');
};

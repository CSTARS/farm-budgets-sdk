var extend = require('extend');
var units = require('../shared/units');
var fb = require('../shared');

module.exports = function(data) {
  this.data = extend(true, {}, data);
};

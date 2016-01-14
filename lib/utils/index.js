'use strict';

var uuid = require('node-uuid');
var extend = require('extend');
var states = require('./states');

var statesLookup = {};
for( var key in states ) {
  statesLookup[states[key].toLowerCase()] = key;
}

function hasAccess(user, authority) {
  if( !user ) {
    return false;
  }
  if( !user.authorities ) {
    return false;
  }
  if( user.authorities.indexOf(authority) > -1 ) {
    return true;
  }
  if( user.email === authority ) {
    return true;
  }

  return false;
}

var api = {
  guid : function() {
    return uuid.v4();
  },
  hasAccess : hasAccess,
  strip : require('./strip'),
  getActiveMaterials : require('./getActiveMaterials'),
  getMaterialIds : require('./getMaterialIds'),
  states : states,
  statesLookup : statesLookup
};

module.exports = api;

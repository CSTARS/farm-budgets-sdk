'use strict';

var data = {};

function reset() {
  data = {};
}

function has(alias) {
  if( data[alias] ) return true;
  return false;
}

function get(alias) {
  if( !alias ) return data;
  return data[alias];
}

function add(alias, material) {
  data[alias] = material;
}

function remove(alias) {
  if( !has(alias) ) return;
  delete data[alias];
}

function set(aliases) {
  reset();
  if( !aliases ) return;

  for( var key in aliases ) {
    data[key] = aliases[key];
  }
}

module.exports = {
  reset : reset,
  has : has,
  get : get,
  remove : remove,
  set : set,
  add : add
};

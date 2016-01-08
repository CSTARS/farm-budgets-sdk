var config = require('../config');
var handler = require('./responsehandler');
var request = require('superagent');

var root = '/materials';

function get(id, callback) {
  request
    .get(config.host+root+'/get')
    .query({id: id})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function hasRequired(id, callback) {
  request
    .get(config.host+root+'/hasRequired')
    .query({id: id})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function search(query, callback) {
  if( query.query ) {
    query.query = JSON.stringify(query);
  }

  request
    .get(config.host+root+'/search')
    .query(query)
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function suggest(query, callback) {
  request
    .get(config.host+root+'/suggest')
    .query({q: query})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function deleteFn(id, callback) {
  request
    .get(config.host+root+'/suggest')
    .query({q: query})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function save(material, callback) {
  request
    .post(config.host+root+'/save')
    .send(material)
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

module.exports = {
  get : get,
  hasRequired : hasRequired,
  search : search,
  suggest : suggest,
  'delete' : deleteFn,
  save : save
};

var config = require('../config');
var handler = require('./responsehandler');
var request = require('superagent');

var root = '/budget';

function get(id, callback) {
  request
    .get(config.host+root+'/get')
    .query({id: id})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function contributedTo(callback) {
  request
    .get(config.host+root+'/contributedTo')
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function uses(materialId, callback) {
  request
    .get(config.host+root+'/uses')
    .query({material : materialId})
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


function deleteFn(id, callback) {
  request
    .get(config.host+root+'/delete')
    .query({id : id})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function save(budget, callback) {
  request
    .post(config.host+root+'/save')
    .send(budget)
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

module.exports = {
  get : get,
  contributedTo : contributedTo,
  uses : uses,
  search : search,
  'delete' : deleteFn
};

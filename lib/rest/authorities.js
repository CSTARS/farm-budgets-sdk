var config = require('../config');
var handler = require('./responsehandler');
var request = require('superagent');

var root = '/authority';

function list(callback) {
  request
    .get(config.host+root+'/get/all')
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function get(name, callback) {
  request
    .get(config.host+root+'/get')
    .query({ name: name })
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function create(authority, callback) {
  request
    .post(config.host+root+'/create')
    .send(authority)
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function update(authority, callback) {
  request
    .post(config.host+root+'/update')
    .send(authority)
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function grantAccess(name, email, callback) {
  request
    .get(config.host+root+'/grantAccess')
    .query({name : name, email : email})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

function removeAccess(name, email, callback) {
  request
    .get(config.host+root+'/removeAccess')
    .query({name : name, email : email})
    .set('x-dev-token', config.token)
    .end(handler(callback));
}

module.exports = {
  list : list,
  get : get,
  create : create,
  grantAccess : grantAccess,
  removeAccess : removeAccess,
  update : update
};

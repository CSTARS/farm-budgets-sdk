var controllers = require('../controllers');

// TODO: this is used by several widgets.  Controller should just keep a list
module.exports = function getMaterialIds() {
  var ids = [];
  var materials = controllers.material.get();

  for( var name in materials ) {
    if( materials[name].id ) {
      ids.push(materials[name].id);
    }
  }

  return ids;
};

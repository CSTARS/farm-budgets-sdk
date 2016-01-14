
var controllers = require('../controllers');

module.export = function getActiveMaterials() {
    var materials = [];

    var operations = controllers.operation.get();
    operations.forEach(function(op){
      _getActiveMaterials(op, materials);
    });

    materials.sort();
    return materials;
};

function _getActiveMaterials(obj, list) {
  if( !obj.materials ) {
    return;
  }

  for( var name in obj.materials ) {
    var def = controllers.material.get(name);

    if( list.indexOf(def.name) === -1 ) {
      list.push(def.name);
    }

    if( def.type === 'complex' ) {
      _getActiveMaterials(def, list);
    }
  }
}

var extend = require('extend');
var unitUtils = require('../units');
var controllers = require('../controllers');
var guid = require('../utils').guid;

module.exports = function(data) {
  this.data = extend(true, {}, data);

  // update the operations controller
  // this will cause a recalc
  this.update = function() {
    controllers.operation.add(this.data, {replace: true});
  };

  // TODO: test
  this.getErrors = function() {
    var errors = controllers.operation.getErrors(this.data.name) || {errors: [], materials: {}};
    if( this.data.message ) {
      errors.errors.push(this.data.message);
    }
    return errors;
  };

  // TODO: test
  this.hasErrors = function() {
    if( this.data.error ) {
      return true;
    }
    return controllers.operation.hasErrors(this.data.name);
  };

  // TODO: add test case
  this.rename = function(name) {
    var exists = false;
    try {
      var op = controllers.operation.get(name);
      exists = true;
    } catch(e) {}
    if( exists ) {
      throw(new Error('Invalid Name. An operation with this name already exists'));
    }

    var oldName = this.data.name;
    this.setName(name);

    controllers.operation.add(this.data,
        {
          noRecalc: true,
          noEvents: true,
          rename : oldName
        }
    );
  };

  this.schedule = function(newEvent) {
    if( !newEvent.date ) throw(new Error('date required'));
    if( !newEvent.length ) throw(new Error('length required'));
    if( !newEvent.units ) throw(new Error('units required'));

    if( newEvent.date instanceof Date ) {
      var m = newEvent.date.getMonth()+1;
      var d = newEvent.date.getDate();
      if( m < 10 ) m = '0'+m;
      if( d < 10 ) d = '0'+d;
      newEvent.date = newEvent.date.getFullYear()+'-'+m+'-'+d;
    } else if( typeof startDate !== 'string' ) {
      throw(new Error('date must be instanceof string or Date'));
    }

    if( !newEvent.date.match(/^\d\d\d\d-\d\d-\d\d/) ) {
      throw(new Error('invalid date format "'+newEvent.date+'", should be: YYYY-MM-DD'));
    }

    if( typeof newEvent.length !== 'number' ) {
      throw(new Error('length must by of type number'));
    }

    units = newEvent.units.toLowerCase().trim();
    if( newEvent.units !== 'year' && newEvent.units !== 'month' && newEvent.units !== 'day' ) {
      throw(new Error('units must be one of the following: year, month or day: '+newEvent.units));
    }

    if( !this.data.schedule ) {
      this.data.schedule = [];
    }

    if( newEvent.index !== undefined ) {
      if( newEvent.index < 0 || newEvent.index >= this.data.schedule ) {
        throw(new Error('Attempting to update invalid index: '+newEvent.index));
      }

      this.data.schedule[newEvent.index] = {
        date : newEvent.date,
        length : newEvent.length+'',
        units : newEvent.units
      };
    } else {
      this.data.schedule.push({
        date : newEvent.date,
        length : newEvent.length+'',
        units : newEvent.units
      });
    }



    this.update();
  };

  this.unschedule = function(schedule) {
    if( !this.data.schedule ) return;

    if( typeof schedule === 'number' ) {
      this.data.schedule.splice(schedule, 1);
      this.update();
    } else if( typeof schedule === 'object' ) {
      var index = this.data.schedule.indexOf(schedule);
      if( index > -1 ) {
        this.data.schedule.splice(index, 1);
        this.update();
      }
    }

    return null;
  };

  this.getSchedule = function() {
    return this.data.schedule || [];
  };

  function addMaterial(impl) {
    if( !impl.name ) throw('material name required');
    if( !impl.amount ) throw('material amount required');
    if( !impl.units ) throw('material units required');

    if( typeof impl.name !== 'string' ) throw('material name must be a string');
    if( typeof impl.amount !== 'number' ) throw('material amount must be a number');
    if( typeof impl.units !== 'string' ) throw('material units must be a string');

    try {
      unitUtils.ucumParse(unitUtils.cleanDollars(impl.units));
    } catch(e) {
      console.log(e);
      throw('invalid units: '+impl.units);
    }

    if( !this.data.materials ) {
      this.data.materials = [];
    }

    var added = false;

    if( !impl.id ) {
      impl.id = guid.v4();
      this.data.materials.push(impl);
      added = true;
    } else {
      var found = false;
      for( var i = 0; i < this.data.materials.length; i++ ) {
        if( this.data.materials[i].id === impl.id ) {
          this.data.materials[i] = impl;
          found = true;
          break;
        }
      }
      if( !found ) {
        throw(new Error('Unknown material id'));
      }
    }

    var eventName = added ? 'material-added' : 'material-updated';

    controllers.operation.getEventsModule().emit(
      eventName,{
        material : impl.name,
        operation : this.data.name
      }
    );
    this.update();
  }

  // TODO: test
  this.addRequiredMaterial = addMaterial;
  this.updateRequiredMaterial = addMaterial;

  this.getRequiredMaterials = function() {
    return this.data.materials || [];
  };

  // can be index or id
  this.removeRequiredMaterial = function(index) {
    if( typeof index === 'number' ) {
      if( index < this.data.materials.length ) {
        this.data.materials.splice(index, 1);
      }
    } else {
      for( var i = 0; i < this.data.materials.length; i++ ) {
        if( this.data.materials[i].id === index ) {
          this.data.materials.splice(i, 1);
          break;
        }
      }
    }

    this.update();
  };

  this.getName = function() {
    return this.data.name;
  };

  // TODO: add check for invalid name
  this.setName = function(name) {
    if( name === '' ) {
      throw(new Error('name cannot be empty'));
    }
    this.data.name = name;
  };

  this.getUnits = function() {
    return this.data.units;
  };

  this.setUnits = function(units) {
    try {
      unitUtils.ucumParse(unitUtils.cleanDollars(units));
    } catch(e) {
      throw('invalid units');
    }

    this.data.units = units;

    this.update();
  };

  // TODO: add test case
  this.getTotal = function() {
    var op = controllers.operation.get(this.data.name);
    if( !op ) return 0;

    return {
      total : op.total,
      subtotal : op.subtotal
    };
  };
};

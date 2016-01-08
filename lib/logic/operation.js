var extend = require('extend');
var units = require('../shared/units');
var fb = require('../shared');

module.exports = function(data) {
  this.data = extend(true, {}, data);

  this.schedule = function(startDate, duration, units) {
    if( !startDate ) throw('startDate required');
    if( !duration ) throw('duration required');
    if( !units ) throw('units required');

    if( startDate instanceof Date ) {
      var m = startDate.getMonth()+1;
      var d = startDate.getDay();
      if( m < 10 ) m = '0'+m;
      if( d < 10 ) d = '0'+d;
      startDate = startDate.getFullYear()+'-'+m+'d';
    } else if( typeof startDate !== 'string' ) {
      throw('startDate must be of type string or date');
    }

    if( !startDate.match(/^\d\d\d\d-\d\d-\d\d/) ) {
      throw('invalid date format "'+startDate+'", should be: YYYY-MM-DD');
    }

    if( typeof duration !== 'number' ) {
      throw('duration must by of type number');
    }

    units = units.toLowerCase().trim();
    if( units !== 'year' || units !== 'month' || units !== 'day' ) {
      throw('units must be one of the following: year, month or day');
    }

    if( !this.data.schedule ) {
      this.data.schedule = [];
    }

    this.data.schedule.push({
      date : startDate,
      interval : interval,
      units : units
    });

    fb.operationController.add(this.data, {replace: true});
  };

  this.unschedule = function(schedule) {
    if( !this.data.schedule ) return null;

    if( typeof schedule === 'number' ) {
      return this.data.schedule.splice(schedule, 1);
    } else if( typeof schedule === 'object' ) {
      var index = this.data.schedule.indexOf(schedule);
      if( index > -1 ) {
        return this.data.schedule.splice(index, 1);
      }
    }

    return null;
  };

  this.getSchedule = function() {
    return this.data.schedule;
  };

  this.addRequiredMaterial = function(name, amount, units) {
    if( !name ) throw('material name required');
    if( !amount ) throw('material amount required');
    if( !units ) throw('material units required');

    if( typeof name !== 'string' ) throw('material name must be a string');
    if( typeof amount !== 'number' ) throw('material amount must be a number');
    if( typeof units !== 'string' ) throw('material units must be a string');

    try {
      units.ucumParse(units.cleanDollars(units));
    } catch(e) {
      throw('invalid units');
    }

    if( !this.data.materials ) {
      this.data.materials = {};
    }

    this.data.materials[name] = {
      amount : amount,
      units : units
    };
  };

  this.getRequiredMaterials = function() {
    return this.data.materials || {};
  };

  this.removeMaterial = function(name) {
    if( this.data.materials && this.data.materials[name] ) {
      delete this.data.materials[name];
    }
  };

  this.getName = function() {
    return this.data.name;
  };

  this.setName = function(name) {
    this.data.name = name;
  };

  this.getUnits = function() {
    return this.data.units;
  };

  this.setUnits = function(units) {
    try {
      units.ucumParse(units.cleanDollars(units));
    } catch(e) {
      throw('invalid units');
    }

    this.data.units = units;
  };
};

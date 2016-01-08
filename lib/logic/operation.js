var extend = require('extend');
var unitUtils = require('../shared/units');
var fb = require('../shared');

module.exports = function(data) {
  this.data = extend(true, {}, data);

  // update the operations controller
  // this will cause a recalc
  this.update = function() {
    fb.operationController.add(this.data, {replace: true});
  };

  this.schedule = function(startDate, length, units) {
    if( !startDate ) throw('startDate required');
    if( !length ) throw('length required');
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

    if( typeof length !== 'number' ) {
      throw('length must by of type number');
    }

    units = units.toLowerCase().trim();
    if( units !== 'year' && units !== 'month' && units !== 'day' ) {
      throw(new Error('units must be one of the following: year, month or day: '+units));
    }

    if( !this.data.schedule ) {
      this.data.schedule = [];
    }

    this.data.schedule.push({
      date : startDate,
      length : length+'',
      units : units
    });

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
      unitUtils.ucumParse(unitUtils.cleanDollars(units));
    } catch(e) {
      console.log(e);
      throw('invalid units: '+units);
    }

    if( !this.data.materials ) {
      this.data.materials = [];
    }

    this.data.materials.push({
      name : name,
      amount : amount,
      units : units
    });

    this.update();
  };

  this.getRequiredMaterials = function() {
    return this.data.materials || [];
  };

  this.removeMaterial = function(index) {
    if( index < this.data.materials.length ) {
      this.data.materials.splice(index, 1);
    }

    this.update();
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
      unitUtils.ucumParse(unitUtils.cleanDollars(units));
    } catch(e) {
      throw('invalid units');
    }

    this.data.units = units;

    this.update();
  };
};

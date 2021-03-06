'use strict';

var uuid = require('node-uuid');
var operationController;
var msPerDay = 86400000;

function init(controller) {
  operationController = controller;
}


function replaceMaterial(materialName, newId) {
  var ops = operationController.get(), op;

  for( var name in ops ) {
    op = ops[name];
    if( !op.materials ) continue;

    for( var j = 0; j < ops.materials.length; j++ ) {
      if( op.materials[j].name === materialName ) {
        op.materials[j].id = newId;
      }
    }
  }
}

function calculatePerMonth(range) {

  var numMonths = getNumMonths(range);

  var months = [];

  if( !range.start ) {
    return months;
  }

  var last = range.start;
  months.push({
    month : toMonthString(last),
    total : 0
  });

  for( var i = 1; i < numMonths; i++ ) {
    last = nextMonth(last);

    months.push({
      month : toMonthString(last),
      total : 0
    });
  }

  var operations = operationController.get();
  for( var name in operations ) {
    var operation = operations[name];
    if( !operation.schedule ) {
      continue;
    }

    for( var j = 0; j < operation.schedule.length; j++ ) {
      var date = operation.schedule[j];

      var d = toDate(date.date);
      var index = getMonthIndex(toMonthString(d), months);
      var length = getIntervalTime(date);

      for( i = 0; i < length; i++ ) {
        if( months.length <= i+index ) {
          months.push({
            month : toMonthString(d),
            total : 0
          });
        }

        months[i+index].total += (operation.subtotal / length);
        months[i+index][operation.name] = operation.subtotal / length;
      }
    }
  }

  return months;
}

function getMonthIndex(month, months) {
  var t = new Date().getTime();
  for( var i = 0; i < months.length; i++ ) {
    if( months[i].month === month ) {
      return i;
    }
  }
  return 0;
}

function toDate(dateStr) {
  var parts = dateStr.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
}

function toMonthString(date) {
  if( !date ) {
    return '1/1900';
  }
  return (date.getMonth()+1)+'/'+(date.getYear()+1900);
}

function nextMonth(date) {
  return new Date(date.getYear()+1900, date.getMonth()+1, date.getDate());
}

function getNumMonths(range) {
  if( !range.stop || !range.start ) {
    return 1;
  }

  var diff = range.stop.getTime() - range.start.getTime();
  if( diff < 86400000 * 30 ) {
    diff = 86400000 * 30;
  }

  // Months between years.
  var months = (range.stop.getFullYear() - range.start.getFullYear()) * 12;

  // Months between... months.
  months += range.stop.getMonth() - range.start.getMonth();

  // Subtract one month if b's date is less that a's.
  if (range.stop.getDate() < range.start.getDate()) {
      months--;
  }

  return months;

  //var days = diff / 86400000;
  //return Math.ceil(days / 30);
}

function getIntervalTime(date) {
  var l = parseInt(date.length);
  if( date.units === 'year' ) {
    return l * 12;
  } else if( date.units === 'month' ) {
    return l;
  } else {
    return 1;
  }
}

module.exports = {
  init : init,
  calculatePerMonth : calculatePerMonth,
  replaceMaterial : replaceMaterial
};

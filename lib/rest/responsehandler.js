'use strict';

module.exports = function(callback){
  return function(err, resp) {
      if( err ) {
        return callback({
          error : true,
          message : 'request error',
          response : err
        });
      }

      if( !resp.ok ) {
        return callback({
          error : true,
          message : 'request error',
          response : err
        });
      }

      callback(resp.body);
  };
};

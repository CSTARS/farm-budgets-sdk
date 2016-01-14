module.exports = {
  locality : function(locality) {
    if( typeof locality === 'string' ) {
      locality = [locality];
    }

    if( !Array.isArray(locality) ) {
      throw('locality must be an array');
    }

    for( var i = 0; i < locality.length; i++ ) {
      if( typeof locality[i] !== 'string' ) {
        throw('locality must be an array of strings');
      }

      // a little bit of cleanup as well.
      locality[i] = locality[i].toLowerCase().trim();
    }
  },

  authority : function(authority) {
    if( typeof authority !== 'string' ) throw('authority name must be a string');
  }
};

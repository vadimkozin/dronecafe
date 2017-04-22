(function () {

  angular
    .module('cafeApp')
    .service('loggingService', loggingService);

  function loggingService () {
      return {
          log_: console.log,
          log: function(){} 
      }
  }
  })();
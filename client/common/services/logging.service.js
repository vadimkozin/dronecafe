// сервис логирования

(function () {

  angular
    .module('cafeApp')
    .service('loggingService', loggingService);

  function loggingService () {
      return {
          log: console.log,
          log_: function(){} 
      }
  }
  })();
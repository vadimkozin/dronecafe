(function () {

  angular
    .module('cafeApp')
    .controller('kitchenCtrl', kitchenCtrl);

  kitchenCtrl.$inject = ['$location','authentication','mySocket', 'loggingService'];
  function kitchenCtrl($location, authentication, mySocket, loggingService ) {
    let vm = this;
    const log = loggingService.log;
    
    vm.pageHeader = {
      title: 'Кухня',
      subtitle: 'Всё будет вовремя'
    };

   
    vm.returnPage = $location.search().page || '/';

   
  }

})();
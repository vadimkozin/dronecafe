(function () {

  angular
    .module('cafeApp')
    .controller('kitchenCtrl', kitchenCtrl);

  kitchenCtrl.$inject = ['$location','authentication','mySocket'];
  function kitchenCtrl($location, authentication, mySocket) {
    let vm = this;
    
    vm.pageHeader = {
      title: 'Кухня',
      subtitle: 'Всё будет вовремя'
    };

   
    vm.returnPage = $location.search().page || '/';

   
  }

})();
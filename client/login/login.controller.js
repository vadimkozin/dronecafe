(function () {

  angular
    .module('cafeApp')
    .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$location', 'authentication', 'mySocket', 'loggingService'];
  function loginCtrl($location, authentication, mySocket, loggingService) {
    let vm = this;
    const log = loggingService.log;
    
    vm.pageHeader = {
      title: 'Добро пожаловать',
      subtitle: ''
    };

    vm.user = {
      email : "",
      name: ""
    };

    vm.returnPage = $location.search().page || '/';

    vm.onSubmit = function () {
      vm.formError = "";
      if (!vm.user.email || !vm.user.name) {
        vm.formError = "Все поля требуются, пожалуйста заполните поля";
        return false;
      } else {
        vm.doLogin();
      }
    };

    vm.doLogin = function() {
      vm.formError = "";
      
      mySocket.on('login', function(data) {
        log(data);
        if (data.err) {
          vm.formError = data.message;
          mySocket.removeListener('login');
        }
        if (data._id) {
          log("DATA:::::", data);
          authentication.saveToken(data.jwt);
          vm.user.name = "";
          vm.user.email = "";
          $location.search('page', null);
          //$location.path(vm.returnPage);
          $location.path('/home');
          mySocket.removeListener('login'); 
        }

      });

      mySocket.emit('login', {
        name: vm.user.name,
        email: vm.user.email,
      });

    };




  }

})();
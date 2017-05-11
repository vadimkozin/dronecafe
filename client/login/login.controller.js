// loginCtrl: контролер для страницы входа /login

(function () {

  angular
    .module('cafeApp')
    .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$scope', '$location', 'authenticationService', 'mySocket', 'loggingService', 'orderService'];
  function loginCtrl($scope, $location, authenticationService, mySocket, loggingService, orderService) {

    let vm = this;
    const log = loggingService.log;
    
    // возвращает возможно ли сохранение данных формы (true/false)
    vm.canSave = function() {
      return $scope.loginForm.$dirty && $scope.loginForm.$valid;
    };

    // что-то выводим в заголовке
    vm.pageHeader = {
      title: 'Добро пожаловать',
      subtitle: ''
    };

    // поля формы
    vm.user = {
      email : "",
      name: ""
    };

    // последняя проверка перед отправкой данных на сервер
    vm.onSubmit = function () {
      vm.formError = "";
      if (!vm.user.email || !vm.user.name) {
        vm.formError = "Все поля требуются, пожалуйста заполните поля";
        return false;
      } else {
        vm.doLogin();
      }
    };

    // процедура входа
    vm.doLogin = function() {
      vm.formError = "";
      orderService.login(vm.user, (err, data) => {
        if (err) {
          vm.formError = err.message;
        }
        if (data) {
          authenticationService.saveToken(data.jwt);
          vm.user.name = "";
          vm.user.email = "";
          $location.path('/home');
        }
      
      });

    } // end vm.doLogin()

  } // end loginCtrl

})();
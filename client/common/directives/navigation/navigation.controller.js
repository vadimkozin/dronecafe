(function () {

  angular
    .module('cafeApp')
    .controller('navigationCtrl', navigationCtrl);

  navigationCtrl.$inject = ['$location', 'authenticationService'];
  function navigationCtrl($location, authenticationService) {
    let vm = this;

    vm.currentPath = $location.path();

    vm.isLoggedIn = authenticationService.isLoggedIn();

    vm.currentUser = authenticationService.currentUser();

    vm.logout = function() {
      authenticationService.logout();
      $location.path('/login');
    };

  }
})();
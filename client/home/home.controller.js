(function () {

  angular
    .module('cafeApp')
    .controller('homeCtrl', homeCtrl);

 homeCtrl.$inject = ['$scope', '$location','authentication','mySocket'];
  function homeCtrl($scope, $location, authentication, mySocket) {
    let vm = this;

    // текущие значения аутентификации
    vm.isLoggedIn = authentication.isLoggedIn();
    vm.currentUser = authentication.currentUser();

    // когда асинхронно пополним счёт, вот оно и пригодиться
    $scope._updateCurrentUser = function() {
      $scope.$apply(function() {
        vm.isLoggedIn = authentication.isLoggedIn();
        vm.currentUser = authentication.currentUser();
      })
    }

    // перенаправим на страницу входа, если пользователь еще не залогировался 
    if (!vm.isLoggedIn) {
      $location.path('/login');
    }

    // что-то пишем в шапке
    vm.pageHeader = {
      title: 'Добро пожаловать в кафе!',
      subtitle: 'Сделайте заказ'
    };

    // пополнить баланс
    vm.doRefill = function() {

      vm.formError = "";
      
      mySocket.on('refill', function(data) {
        if (data.err) {
          vm.formError = data.message;
          mySocket.removeListener('refill');
        }
        if (data._id) {
          authentication.saveToken(data.jwt); // обновляем JWT, так как сумма на счете изменилась
          mySocket.removeListener('refill'); 
          $scope._updateCurrentUser();        // чтобы представление обновило данные
        }

      });
      mySocket.emit('refill', {
        id: vm.currentUser._id,
        summa: 100,   // по заданию увеличиваем на 100
      });
    }



    // ошибки
    vm.showError = function (error) {
      $scope.$apply(function() {
        vm.message = error.message;
      });
    };

    // ДОБАВЛЕНИЕ БЛЮД к ЗАКАЗУ
    vm.isShowListDish =  false;
    
    // добавить блюдо
    vm.doAddDish = function() {
      vm.isShowListDish = true;

      mySocket.on('getmenu', function(data) {
        if (data.err) {
          vm.formError = data.message;
          mySocket.removeListener('getmenu');
        }
        if (data.menuList) {          
          mySocket.removeListener('getmenu');
          vm.menuList = data.menuList;
          console.log(data.menuList); 
        }

      });
      mySocket.emit('getmenu');

    } // end doAddDish

  } // end homeCtrl

})();
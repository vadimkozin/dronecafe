(function () {

  angular
    .module('cafeApp')
    .controller('homeCtrl', homeCtrl);

 homeCtrl.$inject = ['$scope', '$location', 'authentication', 'mySocket', 'order', 'loggingService'];
  function homeCtrl($scope, $location, authentication, mySocket, order, loggingService) {
    
    let vm = this;
    const log = loggingService.log;

    // текущие значения аутентификации
    vm.isLoggedIn = authentication.isLoggedIn();
    vm.currentUser = authentication.currentUser();

    // перенаправим на страницу входа, если пользователь еще не залогировался 
    if (!vm.isLoggedIn) {
      $location.path('/login');
    }
    
    // текущий заказ
    vm.updateOrder = function() {
      order.getOrderByUserId(vm.currentUser._id, (err, data) => {
        log('order:', data);
        vm.currentOrder = data;
        vm.updateSummaOrder();
      });
    };
    vm.updateOrder();
    
    // сумма по заказу
    vm.updateSummaOrder = function() {
      vm.summaOrder = 0;
      if (vm.currentOrder) {
          vm.currentOrder.dishes.forEach((v) => {
            vm.summaOrder += v.dish.price * v.count;
        }); 
      }
    }
  

    // когда асинхронно пополним счёт, вот оно и пригодиться
    $scope._updateCurrentUser = function() {
      $scope.$apply(function() {
        vm.isLoggedIn = authentication.isLoggedIn();
        vm.currentUser = authentication.currentUser();
      })
    }

    // ошибки
    vm.showError = function (error) {
      $scope.$apply(function() {
        vm.message = error.message;
      });
    };


    // что-то пишем в шапке
    vm.pageHeader = {
      title: 'Добро пожаловать в кафе!',
      subtitle: 'Сделайте заказ'
    };

    // показать/скрыть - Подробно по блюду
    vm.switch = {
      _ob: {},
      toggleShowDetails(index) {
         this._ob[index] = this._ob[index] == true ? false : true;
      },
      isShowDetails(index) {
        return this._ob[index];
      }
    };

    // пополнить баланс
    vm.doRefill = function(summa) {

      summa = summa || 100;

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
        summa: summa,   // по заданию увеличиваем на 100
      });
    }




    // ДОБАВЛЕНИЕ БЛЮД к ЗАКАЗУ
    vm.isShowListDish =  false;

    
    // показать меню для добавления блюд к заказу 
    vm.addToOrder = function() {
      vm.isShowListDish = true;

      mySocket.on('getmenu', function(data) {
        if (data.err) {
          vm.formError = data.message;
          mySocket.removeListener('getmenu');
        }
        if (data.menuList) {          
          mySocket.removeListener('getmenu');
          vm.menuList = data.menuList;
          log(data.menuList); 
        }

      });
      mySocket.emit('getmenu');

    } // end addToOrder


    // добавить одно блюдо к заказу
    vm.addDishToOrder = function(dishId) {
      log(dishId);
      let orderId = vm.currentOrder ? vm.currentOrder._id : null;
      let obj = {dishId:dishId, userId:vm.currentUser._id, orderId:orderId};
      log('obj:', obj);
      order.addDishToOrder(obj, (err, data) => {
        log('home.controller.add_dish_to_order::::', data);
        if (err) {
          log('home.controller.add_dish_to_order:', err);
          return;
        }
        if (data) {
          log('DATA:::', data);
          vm.updateOrder();
        }
      });
      
    } // end addDishToOrder

  } // end homeCtrl

})();
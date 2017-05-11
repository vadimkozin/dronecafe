// homeCtrl: контролер для домашней страницы /home

(function () {

  angular
    .module('cafeApp')
    .controller('homeCtrl', homeCtrl);

 homeCtrl.$inject = ['$scope', '$location', 'authenticationService', 'orderService', 'loggingService', 'stateService'];
  function homeCtrl($scope, $location, authenticationService, orderService, loggingService, stateService) {
    
    let vm = this;
    const log = loggingService.log;

    // текущие значения аутентификации
    vm.isLoggedIn = authenticationService.isLoggedIn();
    vm.currentUser = authenticationService.currentUser();

    // перенаправим на страницу входа, если пользователь еще не залогировался 
    if (!vm.isLoggedIn) {
      return $location.path('/login');  
    }

    // все состояния приготовления блюда
    stateService.getStateJsonFromServer((err, data) => {
      vm.states = data;  // vm.states.problems.code, vm.states.problems.name, .. 
    });
    
    // текущий заказ
    vm.updateOrder = function() {
      orderService.getOrderByUserId(vm.currentUser._id, (err, data) => {
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
            if (v.dish.stateId != vm.states.problems.code) { // 4
              vm.summaOrder += v.dish.price * v.dish.discount * v.count;
            }
        }); 
      }
    }
  
    // когда асинхронно пополним счёт, вот оно и пригодиться
    vm.updateCurrentUser = function() {
      $scope.$apply(function() {
        vm.isLoggedIn = authenticationService.isLoggedIn();
        vm.currentUser = authenticationService.currentUser();
      })
    }

    // ошибки
    vm.showError = function (error) {
      $scope.$apply(function() {
        vm.message = error.message;
      });
    };

    // что-то пишем в шапке (для директивы pageHeader)
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

      summa = summa || 100;   // по заданию увеличиваем на 100

      vm.formError = "";
      
      orderService.refill({userId:vm.currentUser._id, summa}, (err, user) => {
        if (err) {
          vm.formError = err.message;
          return;
        }
        if (user) {
          authenticationService.saveToken(user.jwt); // обновляем JWT, так как сумма на счете изменилась
          vm.updateCurrentUser();             // чтобы представление обновило данные          
        }
      });
    }


    // ДОБАВЛЕНИЕ БЛЮД к ЗАКАЗУ
    vm.isShowListDish =  false;

    // показать меню для добавления блюд к заказу 
    vm.showMenu = function() {

      orderService.getMenu((err, data) => {
        if (data.err) {
          vm.formError = data.message;
          return;
        }
      
        vm.menuList = data;
        vm.isShowListDish = true; 
        log('menuList:', vm.menuList);
        
      });
    }

    // добавить одно блюдо к заказу
    vm.addDishToOrder = function(dishId) {

      let orderId = vm.currentOrder ? vm.currentOrder._id : null;
      let obj = {dishId:dishId, userId:vm.currentUser._id, orderId:orderId};

      orderService.addDishToOrder(obj, (err, data) => {
        if (err) {
          log('home.controller.add_dish_to_order:', err);
          return;
        }
        if (data) {
          vm.updateOrder();
        }
      });
      
    } // end addDishToOrder

    // удалить блюдо из заказа
    vm.deleteDishFromOrder = function(dishId, orderId) {
      orderService.subtractDishFromOrder({dishId, orderId}, (err, data) => {
        if (err) {
          log('home.controller.deleteDishFromOrder:', err);
          return;
        }
        if (data) {
          vm.updateOrder();
        }
      });
    }

    // перезаказать блюдо со скидкой 5%
    vm.reOrder = function(dish, dishCount, orderId) {
      log('vm.reOrder :', dish);
      let discount = dish.discount * (100-5)/100;   // делаем скидку в 5% от текущей скидки
      orderService.setDiscountOnDish({dishId:dish._id, orderId, discount, stateId:1}, (err, data) => {
        if (err) {
          log('home.controller.reOrder_err:', err);
          return;
        }
        if (data) {
          log('home.controller.reOrder_data:', data);
          let cost = dish.price * discount * dishCount; 
          log('home.controller.reOrder_cost:', cost);
          vm.doRefill(-cost);
          vm.updateOrder();
        }
      }); 
    }

    // отслеживание изменений состояний блюда на страничке повара
    $scope.$on('socket:changeStateDish', ((sock, user) => {
      
      log('socket:changeStateDish');

      vm.updateOrder();
      
      // если возникли сложности, то и деньги надо вернуть
      if (user.account) {
        
        vm.updateSummaOrder();
        authenticationService.saveToken(user.jwt); // обновляем JWT, так как сумма на счете изменилась
        vm.updateCurrentUser();             // чтобы представление обновило данные
      }

    }));



  } // end homeCtrl

})();
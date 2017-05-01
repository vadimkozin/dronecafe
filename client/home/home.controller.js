(function () {

  angular
    .module('cafeApp')
    .controller('homeCtrl', homeCtrl);

 homeCtrl.$inject = ['$scope', '$location', 'authentication', 'order', 'loggingService', 'stateService'];
  function homeCtrl($scope, $location, authentication, order, loggingService, stateService) {
    
    let vm = this;
    const log = loggingService.log;

    // текущие значения аутентификации
    vm.isLoggedIn = authentication.isLoggedIn();
    vm.currentUser = authentication.currentUser();

    // перенаправим на страницу входа, если пользователь еще не залогировался 
    if (!vm.isLoggedIn) {
      $location.path('/login');
    }

    // список названий состояний заказа
    stateService.getListState((err, data) => {
      vm.stateNames = data;
      log('vm.stateNames:', vm.stateNames);
    });
    
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
            if (v.dish.stateId != 4) {
              vm.summaOrder += v.dish.price * v.count;
            }
        }); 
      }
    }
  
    // когда асинхронно пополним счёт, вот оно и пригодиться
    vm.updateCurrentUser = function() {
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

      summa = summa || 100;   // по заданию увеличиваем на 100уе

      vm.formError = "";
      
      order.refill({userId:vm.currentUser._id, summa}, (err, user) => {
        if (err) {
          vm.formError = err.message;
          return;
        }
        if (user) {
          authentication.saveToken(user.jwt); // обновляем JWT, так как сумма на счете изменилась
          vm.updateCurrentUser();             // чтобы представление обновило данные          
        }
      });
    }


    // ДОБАВЛЕНИЕ БЛЮД к ЗАКАЗУ
    vm.isShowListDish =  false;

    // показать меню для добавления блюд к заказу 
    vm.showMenu = function() {

      order.getMenu((err, data) => {
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

      order.addDishToOrder(obj, (err, data) => {
        if (err) {
          log('home.controller.add_dish_to_order:', err);
          return;
        }
        if (data) {
          vm.updateOrder();
        }
      });
      
    } // end addDishToOrder


    // отслеживание изменений состояний блюда на страничке повара
    $scope.$on('socket:changeStateDish', ((sock, user) => {
      
      vm.updateOrder();
      
      // если возникли сложности, то и деньги надо вернуть
      if (user.account) {
        
        vm.updateSummaOrder();
        authentication.saveToken(user.jwt); // обновляем JWT, так как сумма на счете изменилась
        vm.updateCurrentUser();             // чтобы представление обновило данные
      }

    }));



  } // end homeCtrl

})();
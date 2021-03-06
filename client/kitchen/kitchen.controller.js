// kitchenCtrl: контролер для страницы повора /kitchen

(function () {

  angular
    .module('cafeApp')
    .controller('kitchenCtrl', kitchenCtrl);

  kitchenCtrl.$inject = ['$scope', '$location', 'orderService', 'loggingService','stateService'];
  function kitchenCtrl($scope, $location, orderService, loggingService, stateService ) {
    
    let vm = this;
    
    const log = loggingService.log;
    
    // что-то пишем в шапке страницы (для директивы page-header)
    vm.pageHeader = {
      title: 'Кухня',
      subtitle: 'Всё будет вовремя!'
    };
    
    // запросим все состояния приготовления блюда
    stateService.getStateJsonFromServer((err, data) => {
      vm.states = data;  // vm.states.problems.code, vm.states.problems.name, .. 

      // список Заказано / список Готовятся (для директивы cook-list)
      vm.state = {
        s1: {
          header: 'Заказано',
          bottomTitle: 'Начать готовить',
          stateDish: vm.states.ordered.code, // 1
          nextState: vm.states.cooking.code, // 2
          showCookTimer: false
        },
        s2: {
          header: 'Готовятся',
          bottomTitle: 'Готово',
          stateDish: vm.states.cooking.code,   // 2 
          nextState: vm.states.delivered.code, // 3
          showCookTimer: true 
        }
      }
  });
    // переход блюда в другое состояние
    vm.nextState = function (dish, nextState) {

      log('nextState_dish:', dish);
      
      let obj = {userId:dish.userId, summa:dish.count*dish.price*dish.discount, orderId:dish.orderId, dishId:dish._id, stateId:nextState};
      
      // переход 
      orderService.dishSetState(obj, (err, data) => {
        if (err) {
          log('err:', err);
        }
        if (data) {
          vm.start();   // отображение текущего состояния
        }
      });
      
    }

    // текущее состояние по готовности блюд
    vm.start = function() {     
      orderService.getOrderListAndUsers((err, data) => {
        vm.orderList = data.orderList;
        vm.userList = data.userList;
        vm.users.usersListToObject(vm.userList);
        vm.dishes = vm.getDishesFromOrderList(data.orderList);
        log('dishes:', vm.dishes);
        log(vm.users.outUsers());
      });
    }
    vm.start();
    

    // из списка заказов (3D) получаем список блюд(2D) с дополнительными полями для view
    // в интерфейсе повара отображение будет таким:
    // название1 (7шт) (alex)
    // название1 (1шт) (maksim)
    // название2 (3шт) (alex)
    // название2 (2шт) (maksim)

    vm.getDishesFromOrderList = function(orders) {
      let dishes = [];
      orders.forEach((o) => {
        o.dishes.forEach((d) => {
          let x = angular.copy(d.dish);
          x.userId = o.userId; 
          x.userName = vm.users.getName(o.userId);
          x.userEmail = vm.users.getEmail(o.userId);
          x.count = d.count;
          x.orderId = o._id;
          dishes.push(x);
        })
      });
      return dishes;
    }
    
    // текущие заказчики
    vm.users = {
      _obj: {},
      usersListToObject(userList) {
        userList.forEach(v => this._obj[v._id] = {name: v.name, email:v.email});
      },
      getName(key) { return this._obj[key].name },
      getEmail(key) { return this._obj[key].email },
      outUsers() { return this._obj }
    }      
     
    // отслеживание изменений состояний блюда на страничке повара
    $scope.$on('socket:changeStateDish', function () {
      vm.start();
    });    
      
    
    // это на потом
    vm.returnPage = $location.search().page || '/';

   
  }

})();
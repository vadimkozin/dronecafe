(function () {

  angular
    .module('cafeApp')
    .controller('kitchenCtrl', kitchenCtrl);

  kitchenCtrl.$inject = ['$scope', '$location','authentication','mySocket', 'order', 'loggingService'];
  function kitchenCtrl($scope, $location, authentication, mySocket, order, loggingService ) {
    
    let vm = this;
    
    const log = loggingService.log;
    
    // что-то пишем в шапке страницы
    vm.pageHeader = {
      title: 'Кухня',
      subtitle: 'Всё будет вовремя!'
    };

    // список Заказано / список Готовятся (для директивы cook-list)
    vm.state = {
      s1: {
        header: 'Заказано',
        bottomTitle: 'Начать готовить',
        stateDish: 1,
        nextState: 2
      },
      s2: {
        header: 'Готовятся',
        bottomTitle: 'Готово',
        stateDish: 2,
        nextState: 3        
      }
    }

    // переход блюда в другое состояние
    vm.nextState = function (dish, nextState) {
      
      let obj = {orderId:dish.orderId, dishId:dish._id, stateId:nextState};
      
      // переход 
      order.dishSetState(obj, (err, data) => {
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
      order.getOrderListAndUsers((err, data) => {
        //log('order_list:', data.orderList);
        //log('user_list:', data.userList);
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
 
    
    // это на потом
    vm.returnPage = $location.search().page || '/';

   
  }

})();
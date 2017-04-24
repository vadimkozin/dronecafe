(function () {

  angular
    .module('cafeApp')
    .controller('kitchenCtrl', kitchenCtrl);

  kitchenCtrl.$inject = ['$location','authentication','mySocket', 'order', 'loggingService'];
  function kitchenCtrl($location, authentication, mySocket, order, loggingService ) {
    
    let vm = this;
    
    const log = loggingService.log;
    
    // что-то пишем в шапке страницы
    vm.pageHeader = {
      title: 'Кухня',
      subtitle: 'Всё будет вовремя!'
    };

    // текущий список заказов 
    order.getOrderList((err, data) => {
      log('order_list:', data);
      vm.orderList = data;
      vm.dishes = vm.getDishesFromOrderList(data);
      log('dishes:', vm.dishes);
    });
    
    // из списка заказов получаем список блюд
    vm.getDishesFromOrderList = function(orders) {
      let dishes = [];
      orders.forEach((v,i,a) => {
        let userId = v.userId;
        dishes = dishes.concat(v.dishes);
      });
      return dishes;
    }
    // это на потом
    vm.returnPage = $location.search().page || '/';

   
  }

})();
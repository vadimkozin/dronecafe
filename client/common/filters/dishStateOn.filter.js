// фильтр блюд по состоянию заказа
(function () {

  angular
    .module('cafeApp')
    .filter('dishStateOn', dishStateOn);

  function dishStateOn () {
    return function(dishes, stateId) {
        if (dishes) {
            return dishes.filter( x => {return x.stateId==stateId});
        }
    }
  }

})();
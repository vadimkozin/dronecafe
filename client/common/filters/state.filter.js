// фильтр: преобразует код состояния готовности (1-5) в понятное имя

(function () {
    angular
    .module('cafeApp')
    .filter('state', ['stateService', function(stateService) {
        return function (stateId){
            return stateService.getNameState(stateId);
        };
    }]);
})();
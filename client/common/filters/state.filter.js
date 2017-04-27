// код состояния готовности в виде строки
(function () {
    angular
    .module('cafeApp')
    .filter('state', ['stateService', function(stateService) {
        return function (stateId){
            return stateService.getNameState(stateId);
        };
    }]);
})();
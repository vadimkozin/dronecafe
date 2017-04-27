// валюта -> местная валюта
(function () {
    angular
    .module('cafeApp')
    .filter('currency', [function() {
        return function (value, type) {
            let text = ' гк.';
            if (type && type == 'full') {
                text = ' галактических кредитов';
            }
            return value + text;
        };
    }]);
})();
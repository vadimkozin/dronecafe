// местная валюта

(function () {
    angular
    .module('cafeApp')
    .filter('currency', [function() {

        function isInteger(num) {
            return (num ^ 0) === num;
        }

        return function (value, type) {

            let text = ' гк.';
            
            if (type && type == 'full') {
                text = ' галактических кредитов';
            }

            if (!isInteger(value)) {
                value = value.toFixed(3); 
            }

            return value + text;

        };
    }]);
})();
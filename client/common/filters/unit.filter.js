// количество: (шт., штук)
(function () {
    angular
    .module('cafeApp')
    .filter('unit', [function() {
        return function (value, type) {
            let text = 'шт.';
            if (type && type == 'big') {
                text = 'штук';
            }
            return value + text;
        };
    }]);
})();
// директива: footerPage

(function () {

    angular
        .module('cafeApp')
        .directive('footerPage', footerPage);

        function footerPage() {
            return {
                restrict: 'EA',
                templateUrl:'/common/directives/footerPage/footerPage.template.html'
            };
        }
})();
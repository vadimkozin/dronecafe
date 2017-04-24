(function () {

  angular
    .module('cafeApp')
    .directive('dishDetails', dishDetails);

  function dishDetails () {
    return {
      restrict: 'EA',
      scope: {
        content : '=content',
        pvm: '=pvm'
      },
      templateUrl: '/common/directives/dishDetails/dishDetails.template.html'
    };
  }

})();
(function () {

  angular
    .module('cafeApp')
    .directive('cookList', cookList);

  function cookList () {
    return {
      restrict: 'EA',
      scope: {
        content : '=content',
        pvm: '=pvm',
        
      },
      templateUrl: '/common/directives/cookList/cookList.template.html'
    };
  }

})();
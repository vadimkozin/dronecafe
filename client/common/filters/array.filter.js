(function () {

  angular
    .module('cafeApp')
    .filter('array', array);

  function array () {
    return function(array) {
        return array.join(', ');
    }
  }

})();
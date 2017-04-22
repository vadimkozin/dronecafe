(function () {

  angular
    .module('cafeApp')
    .service('authentication', authentication);

  authentication.$inject = ['$window', 'loggingService'];
  function authentication ($window, loggingService) {
    
    const log = loggingService.log;

    let saveToken = function (token) {
      $window.localStorage['cafe-token'] = token;
    };

    let getToken = function () {
      return $window.localStorage['cafe-token'];
    };

    let isLoggedIn = function() {
      let token = getToken();

      if(token){
        let payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    let currentUser = function() {
      if(isLoggedIn()){
        let token = getToken();
        let payload = JSON.parse($window.atob(token.split('.')[1]));
        log(payload);
        return {
          email : payload.email,
          name : payload.name,
          account: payload.account,
          _id: payload._id
        };
      }
    };

    /*
    register = function(user) {
      return $http.post('/api/register', user).success(function(data){
        saveToken(data.token);
      });
    };

    login = function(user) {
      return $http.post('/api/login', user).success(function(data) {
        saveToken(data.token);
      });
    };
    */
    
    logout = function() {
      $window.localStorage.removeItem('cafe-token');
    };

    return {
      currentUser : currentUser,
      saveToken : saveToken,
      getToken : getToken,
      isLoggedIn : isLoggedIn,
      //register : register,
      //login : login,
      logout : logout
    };
  }

})();
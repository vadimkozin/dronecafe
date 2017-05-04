// Точка входа в приложение 'cafeApp'. Настройка маршрутов и Socket.io

(function () {

angular.module('cafeApp', ['ngRoute', 'btford.socket-io', 'ui.materialize']);

angular
    .module('cafeApp')

.config(['$routeProvider','$locationProvider',
    function config($routeProvider, $locationProvider) {

        $routeProvider.
        when('/', {
            templateUrl: '/home/home.view.html',
            controller: 'homeCtrl',
            controllerAs: 'vm'

        }).
        when('/login', {
            templateUrl: '/login/login.view.html',
            controller: 'loginCtrl',
            controllerAs: 'vm'
        }).

        when('/kitchen', {
            templateUrl: '/kitchen/kitchen.view.html',
            controller: 'kitchenCtrl',
            controllerAs: 'vm'
        }).

        otherwise({
            redirectTo: '/'
        });

        // use the HTML5 history 
        $locationProvider.html5Mode(true);
    }
])


.factory('mySocket', function(socketFactory) {
  //var myIoSocket = io.connect('https://netology-socket-io.herokuapp.com/');
  var myIoSocket = io.connect();
  
    mySocket = socketFactory({
      ioSocket: myIoSocket
    });

    mySocket.forward('changeStateDish');

    return mySocket;
});

})();
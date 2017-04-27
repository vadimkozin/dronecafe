(function () {
//let cafeApp =
angular.module('cafeApp', ['ngRoute', 'btford.socket-io']);

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

        when('/berry/:berryId', {
            templateUrl: 'src/BerryDetail/BerryDetail.html',
            controller: 'BerryDetailCtrl'
        }).
        when('/create', {
            templateUrl: 'src/CreatePokemon/CreatePokemon.html',
            controller: 'CreatePokemonCtrl'
        }).
        when('/realtime/:userName', {
            templateUrl: 'src/PokemonRealtime/PokemonRealtime.html',
            controller: 'PokemonRealtimeCtrl'
        }).

        when('/cafe', {
            templateUrl: 'src/CafeMain/CafeMain.html',
            controller: 'CafeMainCtrl'
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
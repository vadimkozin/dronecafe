// отображение кодов состояний на имена

(function () {

  angular
    .module('cafeApp')
    .service('stateService', stateService);

    stateService.$inject = ['$window', 'mySocket', 'loggingService'];
    function stateService ($window, mySocket, loggingService) {
        
        const log = loggingService.log;

        /**
         * Запрос списка имён состояний заказа
         * @param {Fn} callback 
         */
        let getListState = function(callback) {
            mySocket.on('getListState', function(data) {
                log('state.service.getListState_data:', data);
                if (data.err) {
                    mySocket.removeListener('getListState');
                    callback(data.err, null);
                }
                if (data.stateNames) {
                    mySocket.removeListener('getListState');
                    saveStateNames(data.stateNames);
                    callback(null, data.stateNames);
                }

            });

            mySocket.emit('getListState');
            
        }

        let saveStateNames = function (obj) {
            $window.localStorage['cafe-state-names'] = obj;
        };

        let getStateNames = function () {
            return ($window.localStorage['cafe-state-names']).split(',');
        };

        let getNameState = function (stateId) {
            return getStateNames()[stateId];
        };
        

        return {
            getListState : getListState,
            saveStateNames : saveStateNames,
            getStateNames: getStateNames,
            getNameState : getNameState
        };

    }

})();
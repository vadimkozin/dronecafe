// коды состояний приготовления блюда - запрашиваем на сервере и кладём в локальное хранилище

(function () {

  angular
    .module('cafeApp')
    .service('stateService', stateService);

    stateService.$inject = ['$window', 'mySocket', 'loggingService'];
    function stateService ($window, mySocket, loggingService) {
        
        const log = loggingService.log;

        /**
         * Запрос JSON объекта о состояниях заказа
         * @param {Fn} callback 
         */
        let getStateJsonFromServer = function(callback) {
            mySocket.on('getStateJSON', function(data) {
                log('state.service.getStateJSON_data:', data);
                if (data.err) {
                    mySocket.removeListener('getStateJSON');
                    callback(data.err, null);
                }
                if (data.stateJSON) {
                    mySocket.removeListener('getStateJSON');
                    _saveStateJson(data.stateJSON);                  
                    callback(null, JSON.parse(data.stateJSON));
                }

            });

            mySocket.emit('getStateJSON');
            
        }

        // сохраняет имена в локальном хранилище
        let _saveStateJson = function (obj) {
            $window.localStorage['cafe-state'] = obj;
            $window.localStorage['cafe-state-names'] = _mapStateCodeToName(JSON.parse(obj));        
        };
        
        // возвращает объект всех состояний приготовления блюда (как на сервере)
        let getState = function (obj) {
            return (JSON.parse($window.localStorage['cafe-state']));
        };

        // возвращает имя состояния по коду (1-5)
        let getNameState = function (stateId) {
            return ($window.localStorage['cafe-state-names']).split(',')[stateId];
        };

        // возвращает массив имён состояний: ['-', 'заказано', 'готовится', ..]
        let _mapStateCodeToName= function (state) {
            let arr = ['-'];
            for (let x in state) {
                arr.push(state[x].name);
            }
            return arr;
        }

        return {
            getStateJsonFromServer: getStateJsonFromServer,
            getState: getState,
            getNameState : getNameState
        };

    }

})();
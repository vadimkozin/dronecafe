(function () {

  angular
    .module('cafeApp')
    .service('order', order);

    order.$inject = ['mySocket', 'loggingService'];
    function order (mySocket, loggingService) {
        const log = loggingService.log;
        /**
         * Добавление блюда к заказу. Если заказа еще нет, то создаётся.
         * через callback возвращает код заказа и блюда в заказе
         * если не получилось - то err возвращает объект с ошибкой
         * @param {Object} obj  {userId, dishId, orderId} код клиента, код блюда, номер заказа или null если новый
         * @param {Fn} callback(err, data) - результат, data - всё инфо по заказу
         */
        var addDishToOrder = function(obj, callback) {
            log('order.service:', obj);
            mySocket.on('addDishToOrder', function(data) {
                log('order.service.addDishToOrder_data:', data);
                if (data.err) {
                    mySocket.removeListener('addDishToOrder');
                    callback(data.err, null);
                }
                if (data.data._id) {
                    mySocket.removeListener('addDishToOrder'); 
                    callback(null, data.data);
                }

            });

            mySocket.emit('addDishToOrder', obj);
        };

        /**
         * Возвращает всю инфо по заказу
         * @param {ObjectId} userId код заказчика
         * @param {Fn} callback (err, data) - результат, data = {} 
         */
        let getOrderByUserId = function(userId, callback) {
            mySocket.on('getOrderByUserId', function(data) {
                if (data.err) {
                    mySocket.removeListener('getOrderByUserId');
                    callback(data.err, null);
                }
                if (data._id) {
                    mySocket.removeListener('getOrderByUserId'); 
                    callback(null, data);
                }

            });

            mySocket.emit('getOrderByUserId', {
                userId: userId
            }); 

        };

        return {
            addDishToOrder : addDishToOrder,
            getOrderByUserId : getOrderByUserId,
        };

    }

})();
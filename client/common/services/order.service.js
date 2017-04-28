// общение через Socket.io по вопросам заказа/блюд

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
         * @param {Fn} callback (err, data) - результат
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

        /**
         * Возвращает все заказы
         * @param {Fn} callback (err, data) - результат 
         */
        let getOrderList = function(callback) {
            mySocket.on('getOrderList', function(data) {
                if (data.err) {
                    mySocket.removeListener('getOrderList');
                    callback(data.err, null);
                }
                if (data.orderList) {
                    mySocket.removeListener('getOrderList'); 
                    callback(null, data.orderList);
                }

            });

            mySocket.emit('getOrderList'); 

        };

        /**
         * Возвращает меню (список блюд)
         * @param {Fn} callback (err, data) - результат 
         */
        let getMenu = function(callback) {
            mySocket.on('getmenu', function(data) {
                if (data.err) {
                    mySocket.removeListener('getmenu');
                    callback(data.err, null);
                }
                if (data.menuList) {
                    mySocket.removeListener('getmenu'); 
                    callback(null, data.menuList);
                }

            });

            mySocket.emit('getmenu'); 

        };

        /**
         * Возвращает все заказы и заказчиков
         * @param {Fn} callback (err, data) - результат 
         */
        let getOrderListAndUsers = function(callback) {
            mySocket.on('getOrderListAndUsers', function(data) {
                if (data.err) {
                    mySocket.removeListener('getOrderListAndUsers');
                    callback(data.err, null);
                }
                if (data.orderList) {
                    mySocket.removeListener('getOrderListAndUsers'); 
                    callback(null, {orderList: data.orderList, userList: data.userList});
                }

            });

            mySocket.emit('getOrderListAndUsers'); 

        };

        /**
         * Перевод блюда в другое состояние (1-5)
         * @param {*} obj {orderId, dishId, stateId} код заказа, код блюда, новое состояние
         * @param {*} callback (err, data) - результат, где data-изменённый заказ
         */
        let dishSetState  = function(obj, callback) {
            log('order.dishSetState_obj:', obj);
            mySocket.on('dishSetState', function(data) {
                log('order.dishSetState_data:', data);
                if (data.err) {
                    mySocket.removeListener('dishSetState');
                    callback(data.err, null);
                }
                if (data._id) {
                    mySocket.removeListener('dishSetState');
                    mySocket.emit('changeStateDish', data);
                    callback(null, data);
                }

            });

            mySocket.emit('dishSetState', obj); 

        } // end dishSetState


        /**
         * Пополнение счета
         * @param {*} obj {userId, summa} код клиента, сумма пополнения
         * @param {*} callback (err, data) - результат, где data-
         */
        let refill = function(obj, callback) {
            mySocket.on('refill', function(data) {
                if (data.err) {
                    mySocket.removeListener('refill');
                    callback(data.err, null);
                }
                if (data._id) {
                    mySocket.removeListener('refill');
                    callback(null, data); 
                }

            });
            mySocket.emit('refill', {
                userId: obj.userId,
                summa: obj.summa,   
            });
        }
       



        return {
            addDishToOrder : addDishToOrder,
            getOrderByUserId : getOrderByUserId,
            getOrderList: getOrderList,
            getOrderListAndUsers: getOrderListAndUsers,
            dishSetState: dishSetState,
            refill: refill,
            getMenu: getMenu

        };

    }

})();
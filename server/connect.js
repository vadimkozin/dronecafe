// взаимодействие с клиентом через soket.io

const socketIO = require('socket.io');
const q = require ('../app_api/query');
const log = require('./lib/logging').logging().log;

function go(server) {
    const io = socketIO(server);
    io.on('connection', function(socket) {

        // логин
        socket.on('login', function(msg) {
            
            q.userFindOneOrCreate({name:msg.name, email:msg.email}, (err, data) => {
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    if (err.code === 11000) {   // 11000 dublicate key
                        let message = { err: err, message: `Пользователь с таким email: ${msg.email} уже существует.` };
                        socket.emit('login', message);
                    }
                    return;
                }
                if (data) {
                    socket.emit('login', data);
                    log('LOGIN_DATA :', data);
                }

            });
        
        });

        // пополнение счета
        socket.on('refill', function(msg) {
            q.userRechargeAccount(msg.userId, msg.summa, (err, data) => {
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка пополнения баланса.'};
                    socket.emit('refill', message);
                    return;
                }
                if (data) {
                    socket.emit('refill', data);
                    log('REFILL_DATA:', data);
                }
            });
        });

        // запрос меню
        socket.on('getmenu', function(msg) {
            q.menuList((err, data) => {
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка получения меню.'};
                    socket.emit('getmenu', message);
                    return;
                }
                if (data) {
                    socket.emit('getmenu', { menuList: data });
                    log('GETMENU_DATA:', data);
                }
            });
        });


        //добавление блюда к заказу
         socket.on('addDishToOrder', function(obj) {
            log('connect.add_dish_to_order:', obj);
            q.addDishToOrder(obj, (err, data) => {    
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка добавления блюда к заказу.'};
                    socket.emit('addDishToOrder', message);
                    return;
                }
                if (data) {
                    socket.emit('addDishToOrder', {data: data});
                    log('connect.add_dish_to_order_DATA:', data);
                }

            });
         });

        // Возвращает всю инфо по заказу по коду заказчика
         socket.on('getOrderByUserId', function(obj) {
             log('get_order_by_userid:', obj);
            q.getOrderByUserId(obj.userId, (err, data) => {
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка определения инфо о заказе.'};
                    socket.emit('getOrderByUserId', message);
                    return;
                }
                if (data) {
                    socket.emit('getOrderByUserId', data);
                    log('getOrderByUserId_DATA:', data);
                }

            });
         });

        // возвращает список названий состояния заказа 
        socket.on('getListState', function(obj) {
            log('get_list_state:', obj);
            q.stateList((err, data) => {
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка определения списка названий состояния заказа.'};
                    socket.emit('getListState', message);
                    return;
                }
                if (data) {
                    socket.emit('getListState', {stateNames: data});
                    log('getListState_DATA:', data);
                }

            });
        });

        // возвращает все заказы
        socket.on('getOrderList', function(msg) {
            q.getOrderList((err, data) => {
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка получения списка заказов.'};
                    socket.emit('getOrderList', message);
                    return;
                }
                if (data) {
                    socket.emit('getOrderList', { orderList: data });
                    log('GET_ORDER_LIST:', data);
                }
            });
        });     

        // возвращает все заказы и заказчиков
        socket.on('getOrderListAndUsers', function(msg) {
            q.getOrderListAndUsers((err, data) => {
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка получения списка заказов и заказчиков.'};
                    socket.emit('getOrderListAndUsers', message);
                    return;
                }
                if (data.orderList) {
                    socket.emit('getOrderListAndUsers', { orderList: data.orderList, userList: data.userList });
                    log('GET_ORDER_LIST_AND_USERS:', data);
                }
            });
        });  

        // перевод блюда в заказе в другое состояние (1-5)   
        socket.on('dishSetState', function(obj) {
            q.dishSetState(obj.orderId, obj.dishId, obj.stateId, (err, data) => {
                if (err) {
                    log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка изменения состояния блюда.'};
                    socket.emit('dishSetState', message);
                    return;
                }
                if (data) {
                    socket.emit('dishSetState', data);
                    socket.broadcast.emit('changeStateDish', data);
                    log('DISH_SET_STATE :', data);
                }

            });
        
        });





                 
    });
}
module.exports.go = go;

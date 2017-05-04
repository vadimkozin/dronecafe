// api: Запросы к базе данных

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require ('./db');   //пока
const Dish = require ('./models').Dish;
const User = require ('./models').User;
const Order = require ('./models').Order;
const STATE = require ('./models').STATE;

const log = require('../server/lib/logging').logging().log;

// собирает вместе JWT + данные о пользователе
function _collectUserData(user) {
    let itog = {};
    ['email', 'name', 'account', '_id', ].forEach((v) => itog[v] = user[v]);
    itog.jwt = user.generateJwt();
    return itog;
}

// КЛИЕНТЫ
/**
 * Возвращает данные пользователя + JWT (Json Web Token)
 * Если пользователя нет, то создаёт его
 * @param {Object} data - данные для поиска/создания {name, email}
 * @param {Fn} callback (err, doc) - результат
 */

module.exports.userFindOneOrCreate = function(data, callback) {

    // сначала ищем
    User.findOne({name: data.name, email: data.email}, function(err, doc) {
     
        if (err) { 
            console.log(err);
            return;
        }

        if (!doc) { // не найден, значит это новый клиент
            User.create(data, (err, user) => {
                if (err) { 
                    callback(err, null);
                    return;
                } else {
                    console.log('USER_CREATED:', user);
                    callback(err, _collectUserData(user));
                    return;
                }
            });    
        } else {
            callback(err, _collectUserData(doc));
        }
    });
}

/**
 * Возвращает список пользователей в базе
 * @param {Array} userList - список запрашиваемых пользователей ( если null - то вернуть всех )
 * @param {Fn} callback (err, docs) - результат
 */
module.exports.getUserList = function(userList, callback) {
    let find = {};

    if (userList) {
        find = {_id: {$in: userList} };
    }

    User.find(find, function(err, docs){
     
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, docs);
    });
}

/**
 * Возвращает объект JSON о состояниях заказа
 * @param {Fn} callback (err, docs) - результат
 */
module.exports.getStateJSON = function(callback) {
    callback(null, JSON.stringify(STATE));
}

/**
 * Пополнение счета
 * @param {ObjectId} userId -  код пользователя (_id) 
 * @param {Number} summa - столько добавить к счёту (или вычесть для -summa) 
 * @param {Fn} callback (err, doc) - результат
 */
module.exports.userRechargeAccount = function(userId, summa, callback) {

    User.findByIdAndUpdate(userId, {$inc:{account:summa}}, {new: true}, function(err, user) {
        
        if (err) { 
            return callback(err, null);
        }

        callback(err, _collectUserData(user));
    
    });
}

// МЕНЮ
/**
 * Возвращает список блюд (меню)
 * @param {Fn} callback (err, docs) - результат
 */
module.exports.menuList = function(callback) {
    Dish.find({}, function(err, docs){
     
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, docs);
    });
}

/** 
 * Возвращает одно блюдо
 * @param {ObjectId} id код блюда 
 * @param {Fn} callback (err, doc) - результат
 */
module.exports.getDishOne = function(id, callback) {
    Dish.findById(id, function(err, doc){
     
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, doc);
    });
}

// ЗАКАЗЫ

/**
 * Открытие заказа
 * @param {Object} obj - объект заказа {userId, dishId}  
 * @param {Fn} callback (err, doc) - результат 
 */
 module.exports.orderOpen = function(obj, callback) {
    Dish.findById(obj.dishId, function(err, dishOne) {
        log('module.exports.orderOpen_err:', err);
        log('module.exports.orderOpen_data:', dishOne);
        
        if (err) {
            return callback(err, null);
        }
        if (dishOne) {
            log('module.exports.orderOpen_userId:', obj.userId )
            Order.create({userId:obj.userId, dishes:[{dish:dishOne}]}, function(err, doc) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(err, doc);
            });

        }
        
    });
}

/**
 * Возвращает инфо по заказу по коду заказа
 * @param {ObjectId} orderId - код заказа  
 * @param {Fn} callback (err, doc) - результат (в doc - инфо по заказу)
 */
module.exports.getOrder = function(orderId, callback) {

    Order.findById(orderId, function(err, doc) {
        if (err) {
            callback(err, null);
            return;
        }
        if (doc) {
            callback(null, doc);
        }
    });
}

/**
 * Возвращает инфо по заказу по коду заказчика
 * @param {ObjectId} userId - код заказчика  
 * @param {Fn} callback (err, doc) - результат (в doc - инфо по заказу)
 */
module.exports.getOrderByUserId = function(userId, callback) {

    Order.findOne({userId}, function(err, doc) {
        if (err) {
            callback(err, null);
            return;
        }
        if (doc) {
            callback(null, doc);
        }
    });
}

/**
 * Добавляет блюдо к заказу. Если заказа еще нет, то создаёт его
 * Если добавляется блюдо уже существующее в заказе, то увеличивает счетчик блюда
 * @param {Object} obj объект {userId, dishId, orderId}: кто заказал, что заказал и код заказа (или null)
 * @param {Fn} callback (err, data) - результат
 */
module.exports.addDishToOrder = function(obj, callback) {
    self=this;
    // если заказа еще нет, то открываем заказ
    log('query.add_dish_to_order:', obj);
    if (!obj.orderId) {
        log('obj.orderId', obj.orderId);
        this.orderOpen({userId:obj.userId, dishId:obj.dishId}, (err, doc) => {
            if (err) {
                callback(err, null);
                return;
            }
            if (doc) {
                callback(null, doc);    // новый заказ открыт
                return;
            }
        });
    } 
    else {    // заказ существует

        // в заказе одно блюдо может быть заказано несколько раз
        // поэтому сначала найдём заказ, а потом в нём поищем блюдо, и если есть то увеличим счетчик
        Order.findOne({_id:obj.orderId},  function (err, doc) {
            if (err) { 
                callback(err, null);
                return;
            }
            // forEach - красиво, но в нём нет break
            // doc.dishes.forEach((v,i,a) => { if (a[i].dish._id == obj.dishId) { a[i].count++; }} );
            let newDish = true;
            for (let i = 0; i < doc.dishes.length; i++ ) {
                if (doc.dishes[i].dish._id == obj.dishId) { 
                    doc.dishes[i].count++;
                    newDish = false
                    doc.save();
                    callback(null, doc); 
                    break;
                }
            }
            if (newDish) { // новое блюдо в заказе
                self.getDishOne(obj.dishId, (err, oneDish) => {
                    if (err) return callback(err, null);
                    if (oneDish) {
                        doc.dishes.push({dish:oneDish});
                        doc.save();
                        callback(null, doc);
                        return;
                    }
                });
            }
            
        });
    }

}

/**
 * Уменьшает заказ на обно блюдо
 * @param {Object} obj объект {orderId, dishId}: код заказа и код блюда в нём
 * @param {Fn} callback (err, data) - результат
 */
module.exports.subtractDishFromOrder = function(obj, callback) {

        Order.findOne({_id:obj.orderId},  function (err, doc) {
            if (err) { 
                callback(err, null);
                return;
            }
            if (doc) {
                // forEach - красиво, но в нём нет break
                // doc.dishes.forEach((v,i,a) => { if (a[i].dishId == obj.dishId) { a[i].count--; }} );
                for (let i = 0; i < doc.dishes.length; i++ ) {
                    if (doc.dishes[i].dish._id == obj.dishId) { 
                        doc.dishes[i].count--;
                        
                        if (doc.dishes[i].count <= 0) {
                            doc.dishes.splice(i, 1);    // удаляем блюдо из заказа
                        }
                        doc.save();
                        break;
                    }
                }
                
                // если блюд в заказе не осталось, то и заказ не нужен
                console.log('doc.dishes.length:', doc.dishes.length);
                if (doc.dishes.length == 0) {
                    Order.findByIdAndRemove(obj.orderId, (err, res) => {
                        if (err) {
                            callback(err, null);
                            return;
                        }
                    });
                    callback(null, {message: 'Заказ удалён, так как блюд в нём больше нет.'})
                    return;
                }

            }

            callback(null, doc);
        });

}

/**
 * Удаление заказа
 * @param {ObjectId} orderId код заказа
 * @param {Fn} callback (err, data) - результат
 */
module.exports.deleteOrder = function(orderId, callback) {
    Order.findByIdAndRemove(orderId, (err, doc) => {
        if (err) {
            callback(err, null);
            return; 
        }
        callback(null, doc);
    });
}


/**
 * Перевод заказа в другое состояние (1-5)
 * @param {OrderId} orderId - _id заказа
 * @param {Number} state - новое состояние
 * @param {Fn} callback (err, doc) - результат (в doc - новый изменённый объект)
 */
module.exports.orderSetState = function(orderId, stateId, callback) {
    let opts = { new: true, runValidators: true };
    Order.findByIdAndUpdate(orderId, {stateId}, opts, function(err, doc) {
        if (err) { 
            callback(err, null);
            return;
        }
        callback(err, doc);
    });
}

/**
 * Перевод блюда в заказе в другое состояние (1-5)
 * @param {Object} obj {orderId, dishId, stateId, discount?} 
 *                      код заказа, код блюда, новое состояние блюда, скидка если есть
 * @param {Fn} callback (err, doc) - результат (в doc - новый изменённый объект)
 */
//module.exports.dishSetState = function(orderId, dishId, stateId, callback) {
module.exports.dishSetState = function(obj, callback) {
    
    
    // сначала найдем заказ
    Order.findById(obj.orderId, function(err, order) {
        if (err) { 
            callback(err, null);
            return;
        }

        // в заказе найдём блюдо
        if (order) {
            order.dishes.forEach((v,i,a) => {
                if (v.dish._id == obj.dishId) {
                    v.dish.stateId = obj.stateId;
                    // фиксируем время перевода блюда в другое состояние
                    v.dish.ts['state' + obj.stateId] = Date.now();
                    
                    // если есть скидка на блюдо
                    if (obj.discount) { 
                        v.dish.discount = obj.discount;
                        v.dish.ts.state1 = new Date();
                        // все штампы времени по процессу готовки = dish.ts.state1
                        for (let x in STATE) {
                            code = STATE[x].code;
                            if (v.dish.ts['state' + code]) {
                                v.dish.ts['state' + code] = v.dish.ts.state1;
                            }
                        }

                    }

                    order.save()
                    .then(v => { return callback(null, order)},
                        err => log(err)
                    )
                    
                }
            });
        }
    });
}

/**
 * Перевод всех блюд в одно состояние
 * @param {Number} stateId - новое состояние
 * @param {Fn} callback (err, doc) - результат (в doc - новый изменённый объект)
 */
module.exports.allDishesSetStateOn = function(stateId, callback) {
    
    let opts = { new: true, runValidators: true };

    // все заказы
    Order.find ({}, function(err, orders) {
        if (err) { 
            callback(err, null);
            return;
        }

        // в заказе все блюда
        if (orders) {
            orders.forEach( o => {
                o.dishes.forEach( d => {                
                    d.dish.stateId = stateId;
                    o.save();
                });
            });
            callback(null, {message: `все блюда переведены в состояние: ${stateId}`, });
        }
    });
}

/**
 * Закрыть заказ
 * @param {ObjectId} orederId _id заказа
 * @param {Fn} callback (err, doc) - результат (в doc- новый изменённый объект)
 */
function orderClose(orederId, callback) {
    let opts = { new: true, runValidators: true };
    Order.findByIdAndUpdate(orderId, {closed: true}, opts, function(err, doc) {
        if (err) { 
            callback(err, null);
            return;
        }
        callback(err, doc);
    });

}

//  КУХНЯ

/**
 * Возвращает список заказов
 * @param {Fn} callback (err, docs) - результат
 */
module.exports.getOrderList = function(callback) {
    Order.find({}, function(err, docs){
     
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, docs);
    });
}

/**
 * Возвращает список заказов и список текущих заказчиков
 * @param {Fn} callback (err, docs) - результат, docs:{orderList, userList}
 */
module.exports.getOrderListAndUsers = function(callback) {
    let usersInOrders = [];
    self = this;
    Order.find({}, function(err, orders) {
     
        if (err) {
            callback(err, null);
            return;
        }

        if (orders) {
            orders.forEach(v => usersInOrders.push(v.userId));
            self.getUserList(usersInOrders, (err, users) => {
                if (err) { return callback(err, null) }
                if (users) {
                    callback(null, {orderList:orders, userList:users});        
                }
            });
        }
    });
}
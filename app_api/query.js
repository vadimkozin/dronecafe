// api: Запросы к базе данных

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require ('./db');   //пока
const Dish = require ('./models').Dish;
const User = require ('./models').User;
const Order = require ('./models').Order;

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
 * @param {Fn} callback (err, docs) - результат
 */
module.exports.userList = function(callback) {
    User.find({}, function(err, docs){
     
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, docs);
    });
}

/**
 * Пополнение счета
 * @param {ObjectId} id -  код пользователя (_id) 
 * @param {Number} summa - столько добавить к счёту (или вычесть для -summa) 
 * @param {Fn} callback (err, doc) - результат
 */
module.exports.userRechargeAccount = function(id, summa, callback) {

    User.findByIdAndUpdate(id, {$inc:{account:summa}}, {new: true}, function(err, user) {
        
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

// ЗАКАЗЫ

/**
 * Открытие заказа
 * @param {Object} data - объект заказа {userId, dishId}  
 * @param {Fn} callback (err, doc) - результат 
 */
 module.exports.orderOpen = function(data, callback) {
    Order.create(data, function(err, doc) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, doc);
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

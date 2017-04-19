// обкатка запросов к БД

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require ('./db');
const Dish = require ('./models').Dish;
const User = require ('./models').User;
const q = require ('./query');

// загрузка/проверка данных пользователя
const name = 'Petr';
const email = 'bar@bar.com';
/*
q.userFindOneOrCreate({name, email}, (err, data) => {
    if (err) {
        console.log('ERROR_:(%d) %s', err.code, err.message);
        return;
    }
    if (data) {
        console.log('DATA:', data);
    }
});
*/
/*
// список пользователей
q.userList((err, data) => {
    if (err) {
        console.log('ERROR_:(%d) %s', err.code, err.message);
        return;
    }
    if (data) {
        console.log('DATA:', data);
    }    
});
*/
/*
// список блюд (меню)
q.menuList((err, data) => {
    if (err) {
        console.log('ERROR_:(%d) %s', err.code, err.message);
        return;
    }
    if (data) {
        console.log('DATA:', data);
    }    
});
*/
/*
// увеличить счет пользователя
let user = {name, email, account:300};
q.userRechargeAccount(user, -2000.1, (err, data) => {
    if(err) {
        console.log('ERROR_RECHANGE_ACCOUNT:(%d) %s', err.code, err.message);
    }
    if (data) {
        console.log('user account rechanger:', data);
    }
});
*/

// размещаем новый заказ
const userId = '58ef384aa0826eaeca6a60d2';
const dishId = '58ef458a44acbab651226191';
let order = {userId, dishId, stateId:100};
/*
q.orderOpen(order, (err, data) => {
    if (err) {
       console.log('ERROR_ORDER_NEW: %s', err.message); 
    }
    if (data) {
        console.log('new order:', data);
    }
});
*/

// Перевод заказа в другое состояние
const orderId = '58ef757389281ec91df7b91f';
q.orderSetState(orderId, 5, (err, data) => {
    if (err) {
        console.log('ERROR_SET_STATE_ORDER: %s', err.errors.stateId.message);
    }
    if (data) {
        console.log('set_state_order:', data.stateId); // data - новый изменённый объект
    }
});

setTimeout(() => {
    mongoose.connection.close();
}, 2000);

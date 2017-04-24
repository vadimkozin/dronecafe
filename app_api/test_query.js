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


/*
// размещаем новый заказ
const userId = '58f78dbf4ef83e0566a8450f';
//const dishes = [{dishId:'58f7ce5f5474c12612135e61', count:1}];
const dishId='58f7ce5f5474c12612135e61';
let order = {userId, dishId, stateId:1};

q.orderOpen(order, (err, data) => {
    if (err) {
       console.log('ERROR_ORDER_NEW: %s', err.message); 
       console.log(err);
    }
    if (data) {
        console.log('new order:', data);
    }
});

*/

/*
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
*/


/*

// получить информацию по заказу
//const orderId = null;
const orderId = '58fa09c660ddeff46d23065d';
q.getOrder(orderId, (err, data) => {
    if (err) {
        console.log('ERROR_GET_ORDER: %s', err);
    }
    if (data) {
        console.log('order::', data);          // весь заказ
        console.log('-----');
        console.log('dishes_in_order::', data.dishes);   // инфо по блюдам в заказе
        
    } else {
        console.log('Такой заказ не существует', data);
    }

});
*/
/*
// получить информацию по заказу по коду закзазчика
const userId = '58f78dbf4ef83e0566a8450f---';
q.getOrderByUserId(userId, (err, data) => {
    if (err) {
        console.log('ERROR_GET_ORDER_BY_USERID: %s', err);
    }
    if (data) {
        console.log('order_by_user_id::', data);          // весь заказ
        
    } else {
        console.log('Такой заказ не существует', data);
    }

});
*/

/*
// добавить блюдо в заказ
//let obj = {userId:'58f78dbf4ef83e0566a8450f', dishId:'58f7ce5f5474c12612135e66', orderId:'58fa1443d1017efcdce1463e'};
let obj = {dishId: "58f7ce5f5474c12612135e76", userId: "58f78dbf4ef83e0566a8450f", orderId: "58fa4cf9dcd10e20595949a4"}
q.addDishToOrder(obj, (err,data) => {
    if (err) {
        console.log('ERROR_ADD_DISH: %s', err);
        return;
    }
    if (data) {
        console.log('add_dish_to_order:', data); // data - объект Order
    }

});

*/

/*
// вычесть блюдо из заказа
let obj = {dishId:'58f7ce5f5474c12612135e63', orderId:'58fa1443d1017efcdce1463e'};
q.subtractDishFromOrder(obj, (err, data) => {
    if (err) {
        console.log('ERROR_SUBSTRACT_DISH: %s', err);
        return;
    }
    if (data) {
        console.log('substract_dish_from_order:', data); // data - объект Order
    }
});
*/
/*
// удаление заказа
q.deleteOrder('58f8edc83ac9189143117d4b', (err, data) => {
    if (err) {
        console.log('ERROR_DELETE_ORDER: %s', err);
        return;
    }
    if (data) {
        console.log('delete_order:', data); // data - объект Order
    }
});
*/

// список заказов
q.getOrderList((err, data) => {
    if (err) {
        console.log('ERROR_:(%d) %s', err.code, err.message);
        return;
    }
    if (data) {
        console.log('DATA:', data);
    }    
});

setTimeout(() => {
    mongoose.connection.close();
}, 1000);



// тесты по заказу блюд
const expect = require('chai').expect;
const mongoose = require('mongoose');
const q = require ('../../app_api/query');

log = console.log;

describe('BaseServiceSpec', () => {
    let userId,
        dishId,
        dishId2,
        orderId;

    beforeEach((done) => {
        let [name, email] = ['alex123_123', 'alex123_123@no_email_dadadada.ru'];

        // нужен код пользователя. пересоздаём пользователя для тестов
        q.userDeleteByEmail(email, (err, user) => {
            q.userFindOneOrCreate({name, email}, (err, user) => {               
                userId = user._id;
                // нужен код любого блюда
                q.menuList( (err, menu) => {
                    dishId = menu[10]._id;
                    dishId2 = menu[11]._id;
                    done();
                });
            });
        });
    });

    describe('.order', () => {

         it('Открытие заказа (1 блюдо) и добавление блюда к заказу (+1 блюдо ) работает правильно', done => {
            let obj = {userId, dishId};
            // откроем заказ с одним блюдом
            q.orderOpen(obj, (err, order) => {
                expect(err).is.null;
                expect(order).to.have.property('userId').eql(obj.userId);
                // добавим в заказ еще одно блюдо
                q.addDishToOrder({userId, dishId:dishId2, orderId:order._id}, (err, order) => {
                    expect(err).is.null;
                    expect(order).be.a('object');
                    expect(order.dishes).to.have.length.of.at.least(2);
                    expect(order.dishes[0].dish).to.have.property('_id').eql(dishId);
                    expect(order.dishes[1].dish).to.have.property('_id').eql(dishId2);                    
                    expect(order.dishes[0].dish).to.have.property('stateId').eql(1);
                    q.deleteOrder(order._id, () => done());
                });
            });
         });

         it('Удаление блюда из заказа работает правильно', done => {
            let obj = {userId, dishId};
            // откроем заказ с одним блюдом
            q.orderOpen(obj, (err, order) => {
                expect(err).is.null;
                expect(order).to.have.property('userId').eql(obj.userId);
                // удалим блюдо из заказа, и так как заказ без блюд быть не может, то должен вернуть свойство deleted='ok' 
                q.subtractDishFromOrder({orderId:order._id, dishId}, (err, order) => {
                    expect(err).is.null;
                    expect(order).to.have.property('deleted').eql('ok');
                    done();
                });
            });
         });

         it('Перевод готовности блюда 1 в состояние готовности 5 работает', done => {
            let obj = {userId, dishId};
            // откроем заказ с одним блюдом (блюдо создаётся в состоянии 1)
            q.orderOpen(obj, (err, order) => {
                expect(err).is.null;
                expect(order).to.have.property('userId').eql(obj.userId);
                expect(order.dishes[0].dish).to.have.property('stateId').eql(1);
                // переведём блюдо в состояние 5
                q.dishSetState({orderId:order._id, dishId, stateId:5}, (err, order) => {
                    expect(err).is.null;
                    expect(order.dishes[0].dish).to.have.property('stateId').eql(5);
                    q.deleteOrder(order._id, () => done());
                });
            });
         });

        it('Перевод готовности блюда 1 в состояние готовности 6 выдаёт ошибку', done => {
            let obj = {userId, dishId};
            // откроем заказ с одним блюдом
            q.orderOpen(obj, (err, order) => {
                expect(err).is.null;
                expect(order).to.have.property('userId').eql(obj.userId);
                expect(order.dishes[0].dish).to.have.property('stateId').eql(1);
                // попытка перевести блюдо в состояние 6 
                q.dishSetState({orderId:order._id, dishId, stateId:6}, (err, newOrder) => {
                    expect(err).not.is.null;
                    expect(err).to.have.property('name').eql('ValidationError');
                    expect(err).to.have.property('message').eql('Order validation failed');
                    expect(err.errors['dishes.0.dish.stateId']).to.have.property('message').eql('Path `stateId` (6) is more than maximum allowed value (5).');   
                    q.deleteOrder(order._id, () => done());

                });
            });
         });

        it('Перевод готовности блюда 1 в состояние готовности 0 выдаёт ошибку', done => {
            let obj = {userId, dishId};
            // откроем заказ с одним блюдом
            q.orderOpen(obj, (err, order) => {
                expect(err).is.null;
                expect(order).to.have.property('userId').eql(obj.userId);
                expect(order.dishes[0].dish).to.have.property('stateId').eql(1);
                // попытка перевести блюдо в состояние 0 
                q.dishSetState({orderId:order._id, dishId, stateId:0}, (err, newOrder) => {
                    expect(err).not.is.null;
                    expect(err).to.have.property('name').eql('ValidationError');
                    expect(err).to.have.property('message').eql('Order validation failed');
                    expect(err.errors['dishes.0.dish.stateId']).to.have.property('message').eql('Path `stateId` (0) is less than minimum allowed value (1).');   
                    q.deleteOrder(order._id, () => done());
                });
            });
         });


    });

    //

});
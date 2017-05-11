// тесты по меню (список блюд)
const expect = require('chai').expect;
const mongoose = require('mongoose');
const q = require ('../../app_api/query');

describe('BaseServiceSpec', () => {
    describe('.menu', () => {
        let pattern = /\.jpg$|\.jpeg$|\.png$/i,
            dishId = 0;

        it ('В меню не менее 50 блюд и в каждом элементе есть картинка', done => {
            q.menuList( (err, menu) => {
                expect(err).is.null;
                expect(menu).to.have.length.of.at.least(50);        
                let image_all = menu.every( v => { return pattern.test(v.image)});
                expect(image_all).to.be.true;
                dishId = menu[10]._id;
                done();
            });
        });

        it ('Запрос инфо о блюде по _id работает корректно', done => {
            q.getDishOne(dishId, (err, dish) => {
                expect(err).is.null;
                expect(dish).to.have.property('_id').eql(dishId);           
                done();
            });
        });


    });

});

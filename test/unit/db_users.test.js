const expect = require('chai').expect;
const q = require ('../../app_api/query');

describe('BaseServiceSpec', () => {
    describe('.user', () => {
        let name = 'alex123_123',
            name2 = 'alex123_123_xxxxx', 
            email = 'alex123_123@no_email_dadadada.ru',
            userId = 0;
            
        it('Для нового пользователя на счёт зачисляется 100 гк.', done => {
            
            q.userFindOneOrCreate({name, email}, (err, user) => {
                expect(err).is.null;
                expect(user).to.have.property('name', name);
                expect(user).to.have.property('email', email);
                expect(user).to.have.property('account', 100);
                userId = user._id;
                done();
            });
        });


        it('Увеличение счета пользователя на 500 гк. работает правильно', done => {
            
            q.userRechargeAccount(userId, 500, (err, user) => {
                expect(err).is.null;
                expect(user).to.have.property('account', 100+500);
                done();
            });
        });
        

        it('При создании пользователя с существующим email выдаст ошибку', done => {
            
            q.userFindOneOrCreate({name2, email}, (err, user) => {
                expect(err).not.is.null;
                done();
            });
        });


        it('По имени и email вернёт пользователя', done => {
    
            q.userFindOneOrCreate({name, email}, (err, user) => {
                expect(err).is.null;
                expect(user).to.have.property('name', name);
                expect(user).to.have.property('email', email);
                done();
            });
        });


        it('Удаление пользователя по адресу почты проходит корректно', done => {
            
            q.userDeleteByEmail(email, (err, user) => {
                expect(err).is.null;
                expect(user).to.have.property('name', name);
                expect(user).to.have.property('email', email);
                done();
            });
        });
        
    });
});
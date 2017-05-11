const AngularLoginpage = require('./page-objects/loginpage.po.js');

describe('HomePage Tests', function() {
    const EC = protractor.ExpectedConditions;

    const angularLoginpage = new AngularLoginpage();
    
    const params = browser.params;    
    
    beforeEach(() => {  
        angularLoginpage.get();    
        angularLoginpage.setName(params.login.name);
        angularLoginpage.setEmail(params.login.email);
        angularLoginpage.buttonSubmit.click();
    });

    _getValueBalance = function(text) {
        const pattern = /ваш баланс:\s+(\d+)\s+гк.$/;
        let result = pattern.exec(text);
        return result ? parseInt(result[1]) : null;
    }

    // возвращает баланс клиента как Promise
    getBalance = function() {
        return new Promise((resolve, reject) => {
            const elm = element(by.exactBinding('vm.currentUser.account'));
            browser.wait(EC.visibilityOf(elm), 5000);
            elm.getText().then(v => {
                resolve(_getValueBalance(v));
            });
        });
    } 

    // возвращает имя и стоимость блюда
    getNameAndCost = function(text) {
        // text-text (99 гк.) => return [text-text, 99 ]
        const pattern = /(.+)\((\d+)\s+гк.\)$/;
        let result = pattern.exec(text);
        return result ? [result[1], result[2]] : null;
    }
    

    it('кнопка "Пополнить" увеличивает баланс на 100', () => {

        let account_before = 0;

        // баланс клиента до нажатия кнопки Пополнить
        getBalance().then(v => account_before = v);

        // нажмём на кнопку Пополнить
        element(by.css('button[name="add"]')).click();

        // баланс клиента после нажатия кнопки
        getBalance().then(account_post => {
            expect(account_post - account_before).toEqual(100);
        }); 

    });
    
    // показывает меню (список блюд)
    showMenu = function () {
        const elm = element(by.css('button[ng-click="vm.showMenu()"]'));
        browser.wait(EC.presenceOf(elm), 5000);
        elm.click();

        const dishList = element.all(by.repeater("menuItem in vm.menuList | orderBy:'title'"));        
        browser.wait(EC.presenceOf(dishList), 5000);
        expect(dishList.count()).toEqual(50);  
        return dishList;      
    }

    it('при нажатии на кнопку "Добавить" появляется меню из 50 блюд', () => {
        showMenu();
    });

    it('при выборе блюда из меню - оно появляется в заказе и баланс клиента уменьшается на стоимость блюда', () => {

        let [account_before, costDish, nameDish] = [0, 0, ''];

        const dishList = showMenu();
        
        // баланс клиента до добавления блюда
        getBalance().then(v => account_before = v);

        // возьмём первое блюдо из меню и добавим в заказ
        dishList.first().element(by.css('#add-dish-to-order')).click();
        dishList.first().getText().then(function (text) {            
        
            text = text.split('\n')[1];
            
            // название блюда и стоимость
            [nameDish, costDish] = getNameAndCost(text);

            // это блюдо должно быть в списке заказанных
            const orderList = element.all(by.repeater("dishOne in vm.currentOrder.dishes"));        
            browser.wait(EC.presenceOf(orderList), 5000);
            expect(orderList.first().getText()).toContain(nameDish);

            // и баланс клиента должен уменьшиться на стоимость блюда
            getBalance().then(account_post => {
                expect(account_before - account_post).toEqual(parseInt(costDish));
            });

            //browser.get('http://localhost:3000/kitchen');
            //browser.pause();
        });

    });

});
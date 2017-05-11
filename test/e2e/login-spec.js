const AngularLoginpage = require('./page-objects/loginpage.po.js');

describe('LoginPage Tests', function() {

    const EC = protractor.ExpectedConditions;

    const angularLoginpage = new AngularLoginpage();
    
    const params = browser.params;    
    
    beforeEach(() => {  
        angularLoginpage.get();    
        angularLoginpage.setName(params.login.name);
        angularLoginpage.setEmail(params.login.email);
    });
   
    
    it('при задании имени и email пускает на сайт', function() {
        angularLoginpage.buttonSubmit.click().then(() => {
            expect(browser.getCurrentUrl()).toBe('http://localhost:3000/');
            expect(element(by.css('button[ng-click="vm.doRefill()"]')).isPresent()).toBe(true);
            expect(element(by.exactBinding('vm.currentUser.name')).getText()).toEqual(params.login.name);
        });
    });

  
    it('при задании одинакового email для 2-х разных имён не пускает на сайт', function() {
        angularLoginpage.nameInput.clear();
        angularLoginpage.setName('abc');

        element(by.css('button[type="submit"]')).click();

        let message = `Пользователь с таким email: ${params.login.email} уже существует`;

        let elm = element(by.exactBinding('vm.formError'));
        
        browser.wait(EC.presenceOf(elm), 5000);
        
        expect(elm.getText()).toContain(message);
   
    });
});
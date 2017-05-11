const AngularLoginpage = function() {
  
  this.nameInput = element(by.model('vm.user.name'));
  this.emailInput = element(by.model('vm.user.email'));
  this.buttonSubmit = element(by.css('button[type="submit"]'));

  this.get = function() {
    browser.get('http://localhost:3000/login');
  };

  this.setName = function(name) {
    this.nameInput.sendKeys(name);
  };

  this.setEmail = function(email) {
    this.emailInput.sendKeys(email);
  };
  
};
module.exports = AngularLoginpage;
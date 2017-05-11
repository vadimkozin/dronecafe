exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./test/e2e/**/*spec.js'],
  capabilities: {
    browserName: 'chrome'
  },
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.
  },
  // This can be changed via the command line as:
  // --params.login.user 'myuser'
  params: {
    login: {
      name: 'vadim-test-123',
      email: 'vadim-test-123@mail.ru'
    }
  },
  onPrepare: function() {
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.TerminalReporter({
      verbosity: 3,
      color: true,
      showStack: false
    }));

  }
}


module.exports.logging = function () {
      return {
          log: process.env.NODE_ENV === 'production' ? function(){} : console.log,
          log_: console.log    
      }
}
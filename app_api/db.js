let mongoose = require('mongoose');
let shutdownMongoose;
let dbURI = 'mongodb://localhost/dronecafe';
if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI);

// события соединения
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

// закрытие соединения с MongoDB
shutdownMongoose = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};
// для перезапуска nodemon
process.once('SIGUSR2', function() {
    shutdownMongoose('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// для завершения приложения
process.on('SIGINT', function() {
    shutdownMongoose('app termination', function() {
        process.exit(0);
    });
});
// для завершения приложения Heroku
process.on('SIGTERM', function() {
    shutdownMongoose('Heroku app termination', function() {
        process.exit(0);
    });
});

// схемы и модели
require('./models');

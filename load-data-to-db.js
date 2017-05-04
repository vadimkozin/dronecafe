#!/usr/bin/env node

// Инициализация БД. Загрузка данных для меню
require('dotenv').load();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require ('./app_api/db');
const Dish = require ('./app_api/models').Dish;

// данные
let json = require('./data/menu.json');

// очистка коллекции и загрузка данных
mongoose.connection.collection('dishes').drop((err, result)=> {
    console.log('drop dishes:', result);

    // загрузка данных
    Dish.insertMany(json, function(err,result) {
    if (err) {
        // handle error
        console.log('ERR:', err);
        
    } else {
        // handle success
        console.log('load data: OK');
    }
    });
});

setTimeout(() => {
    mongoose.connection.close();
}, 2000);

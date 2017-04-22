const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// состояние блюда
class State {
    static get stateNames() { return ['-','Заказано', 'Готовиться', 'Доставляется', 'Возникли сложности', 'Подано'];}
    static  getName(state) {return State.stateNames[state];} // имя состояния
    static get ordered() {return 1;}    // заказано
    static get cook() {return 2;}       // готовиться
    static get delivered() {return 3;}  // доставляется
    static get problems() {return 4;}   // возникли сложности
    static get served() {return 5;}     // подано
};

// схема: Блюдо
let dishShema = new mongoose.Schema({
    title: {type:String, required:true},
    image: {type:String, required:true},
    id: {type:Number, required:true, unique: true},
    rating: {type:Number, required:true},
    ingredients: [String],
    price: {type:Number, required:true}
}, {versionKey: false}
);

// схема: Клиент
let userShema = new mongoose.Schema({
    name: {type:String, required:true, trim:true, minlength:2, maxlength:30 },
    email: {type:String, required:true, unique: true, lowercase:true, validate:/.+@.+\..+/i},
    account: {type:Number, required:true, "default":100},
    hash: String,
    salt: String
}, {versionKey: false}
);

// в нашем задании отслеживать правильный паспорт не нужно ( код на будущее )
userShema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userShema.methods.validPassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

// генерация веб-маркера JSON, будет передаваться между клиентом и сервером
userShema.methods.generateJwt = function() {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 1); // + 1 день

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        account: this.account,
        exp: parseInt(expiry.getTime() / 1000),  // как время Unix в секундах
    }, process.env.JWT_SECRET);
};

// схема: количество блюд в заказе
let dishItem = new mongoose.Schema({
    dish: dishShema,
    count: {type: Number,  "default":1}
    },{ _id: false }
);

// схема: Заказ
let orderShema = new mongoose.Schema({
    userId: {type: mongoose.SchemaTypes.ObjectId, required:true, index:true},       // кто заказал
    dishes: [dishItem],                                                 // что заказал (список блюд)
    stateId: {type: Number, min:1, max:5, required:true, "default":1},  // состояние заказа
    startCook: {type: Date, "default": Date.now},                       // начали готовить
    endCook: {type: Date, "default": new Date("1111/11/11 00:00:00")},  // закончили готовить
    served: {type: Date, "default": new Date("1111/11/11 00:00:00")},   // подали к столу
    closed: {type: Boolean, required:true, "default":false}             // заказ закрыт?
}, {versionKey: false}
);

// модели
const Dish = mongoose.model('Dish', dishShema);
const User = mongoose.model('User', userShema);
const Order = mongoose.model('Order', orderShema);

module.exports = {
    State,
    User,
    Dish,
    Order
}
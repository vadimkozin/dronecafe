// взаимодействие с клиентом через soket.io

const socketIO = require('socket.io');
const q = require ('../app_api/query');

function go(server) {
    const io = socketIO(server);
    io.on('connection', function(socket) {

        // логин
        socket.on('login', function(msg) {
            
            q.userFindOneOrCreate({name:msg.name, email:msg.email}, (err, data) => {
                if (err) {
                    console.log('ERROR_:(%d) %s', err.code, err.message);
                    if (err.code === 11000) {   // 11000 dublicate key
                        let message = { err: err, message: `Пользователь с таким email: ${msg.email} уже существует.` };
                        socket.emit('login', message);
                    }
                    return;
                }
                if (data) {
                    socket.emit('login', data);
                    console.log('LOGIN_DATA :', data);
                }

            });
        
        });

        // пополнение счета
        socket.on('refill', function(msg) {
            q.userRechargeAccount(msg.id, msg.summa, (err, data) => {
                if (err) {
                    console.log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка пополнения баланса.'};
                    socket.emit('refill', message);
                    return;
                }
                if (data) {
                    socket.emit('refill', data);
                    console.log('REFILL_DATA:', data);
                }
            });
        });

        // запрос меню
        socket.on('getmenu', function(msg) {
            q.menuList((err, data) => {
                if (err) {
                    console.log('ERROR_:(%d) %s', err.code, err.message);
                    let message = {err: err, message: 'Ошибка получения меню.'};
                    socket.emit('getmenu', message);
                    return;
                }
                if (data) {
                    socket.emit('getmenu', { menuList: data });
                    console.log('GETMENU_DATA:', data);
                }
            });
        });        

    });
}
module.exports.go = go;

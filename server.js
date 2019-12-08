let app = require('express')();
let server = require('http').Server(app);
let socket = require('socket.io')(server);
let redis = require('redis');
require('child_process').execFile('redis/redis-server.exe');

server.listen(8080);
socket.on('connection', function (socket) {
    socket.on('register', function (response) {
        console.log(response);
        let register = redis.createClient();
        response.forEach((index) => {
            register.subscribe(index);
        });
        register.on("message", function (channel, message) {
            socket.emit(channel, message);
        });
        socket.on('disconnect', function () {
            register.quit();
        });
    });
    socket.on('message_response', function (message) {
        let send = redis.createClient();
        message.names.forEach((index) => {
            send.publish(index, JSON.stringify({message: message.message}));
        });
    });
});
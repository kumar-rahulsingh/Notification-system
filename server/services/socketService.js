const { Server } = require('socket.io');
const { getChannel } = require('../config/rabbitmq');
let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);

        // Listen for a custom event to join a user-specific room
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected', socket.id);
        });
    });

    const channel = getChannel();
    const queue = 'notifications';

    channel.assertQueue(queue, { durable: false });
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

    channel.consume(queue, (msg) => {
        const notification = JSON.parse(msg.content.toString());
        console.log(' [x] Received %s', notification);

        // Emit notification to the user-specific room
        io.to(notification.userId).emit('notification', notification);
    }, { noAck: true });
};

module.exports = { initializeSocket };

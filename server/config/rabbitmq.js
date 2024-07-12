const amqp = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URI);
        console.log('Connected to RabbitMQ successfully');
        
        channel = await connection.createChannel();
        await channel.assertQueue('notifications', { durable: false });
        
        console.log('RabbitMQ channel created and queue asserted');
    } catch (error) {
        console.error('Error during RabbitMQ connection setup:', error);
        throw error;
    }
};

const getChannel = () => {
    if (!channel) {
        throw new Error('RabbitMQ channel is not set');
    }
    return channel;
};

const getConnection = () => {
    if (!connection) {
        throw new Error('RabbitMQ connection is not set');
    }
    return connection;
};

module.exports = { connectRabbitMQ, getChannel, getConnection };

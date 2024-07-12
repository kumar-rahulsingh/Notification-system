require('dotenv').config();
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connectRabbitMQ, getChannel } = require('./config/rabbitmq');
const connectDB = require('./config/db');
const { initializeSocket } = require('./services/socketService');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

async function startServer() {
  try {
    await connectDB();

    // RabbitMQ connection
    await connectRabbitMQ();
    initializeSocket(server); // Initialize socket after RabbitMQ connection

    // Swagger setup
    const swaggerOptions = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'Notification System API',
          version: '1.0.0',
          description: 'API for the Notification System',
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 3000}`,
          },
        ],
      },
      apis: ['./routes/*.js'],
    };

    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api', notificationRoutes);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit the process if initialization fails
  }
}

startServer();

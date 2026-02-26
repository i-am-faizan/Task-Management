require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route files
const auth = require('./routes/authRoutes');
const tasks = require('./routes/taskRoutes');

// Connect to Database
connectDB();

const decryptPayload = require('./middlewares/decryptMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Standard Middlewares
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true })); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse Cookies
app.use(decryptPayload); // Decrypt encrypted payloads

// Mount routers
app.use('/api/auth', auth);
app.use('/api/tasks', tasks);

// Health-check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Basic Error Handler
app.use((err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

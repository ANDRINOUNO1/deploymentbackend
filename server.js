require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./_helpers/db');
const errorHandler = require('./_middleware/error-handler');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://thriving-adventure-production.up.railway.app', 'https://your-frontend-domain.com']
        : true,
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- Start Server only after DB initialization ---
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;

db.initialize()
    .then(() => {
        // --- API routes are setup AFTER the DB is ready ---
        app.use('/accounts', require('./account/account.controller'));
        app.use('/bookings', require('./booking/booking.controller'));
        app.use('/rooms', require('./rooms/room.controller').router);
        app.use('/archives', require('./booking/archive.controller'));

        // Health check endpoint for Railway
        app.get('/health', (req, res) => {
            res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        // --- Global error handler ---
        app.use(errorHandler);

        // --- Start listening for requests ---
        app.listen(port, () => {
            console.log('Server listening on port ' + port);
        });
    })
    .catch((err) => {
        console.error("Database initialization failed:", err);
        process.exit(1); // Exit the process with an error code
    });

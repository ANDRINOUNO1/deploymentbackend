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

// CORS configuration - allow specific origins
const allowedOrigins = [
  'https://hotelbookingui.onrender.com', // Render frontend
  'http://localhost:4200', // Local development
  'http://localhost:3000'  // Alternative local development
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

// --- Start Server only after DB initialization ---
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;

db.initialize()
    .then(() => {
        // --- API routes are setup AFTER the DB is ready ---
        app.use('/accounts', require('./account/account.controller'));
        app.use('/bookings', require('./booking/booking.controller'));
        app.use('/rooms', require('./rooms/room.controller').router);
        app.use('/archives', require('./booking/archive.controller'));

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

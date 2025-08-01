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

// Handle preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://hotelbookingui.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// CORS configuration
app.use(cors({
  origin: 'https://hotelbookingui.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin,
      method: req.method
    }
  });
});

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

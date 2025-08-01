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

// Comprehensive CORS configuration
app.use((req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', 'https://hotelbookingui.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Additional CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://hotelbookingui.onrender.com',
      'http://localhost:4200',
      'http://localhost:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Simple test endpoint (no database required)
app.get('/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is responding',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin,
      method: req.method
    }
  });
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

// --- Start Server with graceful database handling ---
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;

// Start server immediately, then try to initialize database
app.listen(port, () => {
    console.log('Server listening on port ' + port);
    
    // Try to initialize database after server starts
    db.initialize()
        .then((success) => {
            if (success) {
                console.log('Database initialized successfully');
            } else {
                console.log('Database initialization failed, but server is running');
            }
        })
        .catch((err) => {
            console.error("Database initialization error:", err);
            console.log("Server is running but database is not available");
        });
});

// Setup routes after server starts (database or not)
app.use('/accounts', require('./account/account.controller'));
app.use('/bookings', require('./booking/booking.controller'));
app.use('/rooms', require('./rooms/room.controller').router);
app.use('/archives', require('./booking/archive.controller'));

// --- Global error handler ---
app.use(errorHandler);

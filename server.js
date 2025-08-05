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

// CORS configuration for Railway
app.use(cors({
  origin: ['https://hotelbookingui.onrender.com', 'http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin']
}));

app.use((req, res, next) => {
  // Allow both deployed and local development origins
  const allowedOrigins = ['https://hotelbookingui.onrender.com', 'http://localhost:4200'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running on Railway',
    timestamp: new Date().toISOString()
  });
});

// --- Start Server only after DB initialization ---
const port = process.env.PORT || 4000;

db.initialize()
    .then(() => {
        // --- API routes are setup AFTER the DB is ready ---
        app.use('/accounts', require('./account/account.controller'));
        app.use('/bookings', require('./booking/booking.controller'));
        app.use('/rooms', require('./rooms/room.controller').router);
        app.use('/archives', require('./booking/archive.controller'));
        app.use('/room-availability', require('./rooms/room-availability.controller'));

        // --- Global error handler ---
        app.use(errorHandler);

        // --- Start listening for requests ---
        app.listen(port, () => {
            console.log('Server listening on port ' + port);
            console.log('Railway deployment ready!');
        });
    })
    .catch((err) => {
        console.error("Database initialization failed:", err);
        process.exit(1); // Exit the process with an error code
    });

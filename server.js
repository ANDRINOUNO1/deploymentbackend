const express = require('express');
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for all responses
app.use((req, res, next) => {
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

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Test endpoints
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

app.post('/accounts/authenticate', (req, res) => {
  res.json({
    message: 'Authentication endpoint is working',
    body: req.body,
    cors: {
      origin: req.headers.origin,
      method: req.method
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
    console.log('CORS is configured for: https://hotelbookingui.onrender.com');
});

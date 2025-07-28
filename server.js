const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./_helpers/db');
const authorize = require('./_middleware/authorize');
const errorHandler = require('./_middleware/error-handler');

const app = express();

app.use(express.json()); // Body parser for JSON

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Accountsshish
app.use('/api/accounts', require('./account/account.controller'));

// Bookinggyat
app.use('/api/bookings', require('./booking/booking.controller'));
app.use('/api/rooms', require('./booking/room.controller'));

// Start server after DB sync
const port = process.env.PORT || 4000;
db.initialize().then(() => {
db.sequelize.sync({ alter: true }).then(() => {
    app.listen(port, () => {
        console.log('Server listening on port ' + port);
    });
});
});
const express = require('express');
const router = express.Router();
const bookingService = require('./booking.service');
const emailService = require('../_helpers/email.service');

//api/bookings
router.post('/', async (req, res) => {
    try {
        const bookings = await bookingService.createBooking(req.body);
        console.log('📝 Booking created with room_id:', bookings[0]?.room_id);
        res.status(201).json(bookings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//api/bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await bookingService.getAllBookings();
        res.json(bookings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//api/bookings/check-email/:email
router.get('/check-email/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const existingBooking = await bookingService.getBookingByEmail(email);
        res.json({ 
            exists: !!existingBooking,
            booking: existingBooking 
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//api/bookings/:id
router.get('/:id', async (req, res) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//PUT /api/bookings/:id
router.put('/:id', async (req, res) => {
    try {
        const booking = await bookingService.updateBooking(req.params.id, req.body);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//PATCH /api/bookings/:id/extend
router.patch('/:id/extend', async (req, res) => {
    try {
        console.log('Extend request received:', req.body);
        const booking = await bookingService.extendBooking(req.params.id, req.body);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        console.error('Error extending booking:', err);
        res.status(400).json({ message: err.message });
    }
});

//PATCH /api/bookings/:id/check-in
router.patch('/:id/check-in', async (req, res) => {
    try {
        console.log('Check-in request received for booking ID:', req.params.id);
        const booking = await bookingService.checkInBooking(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found or cannot be checked in' });
        res.json(booking);
    } catch (err) {
        console.error('Error checking in booking:', err);
        res.status(400).json({ message: err.message });
    }
});

//api/bookings/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await bookingService.deleteBooking(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Booking not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Debug email configuration endpoint
router.get('/debug-email-config', async (req, res) => {
    try {
        emailService.checkEmailConfig();
        res.json({ 
            message: 'Email configuration logged to console',
            emailUser: process.env.EMAIL_USER || 'your-email@gmail.com',
            emailPasswordSet: !!process.env.EMAIL_PASSWORD
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Send payment confirmation email endpoint
router.post('/send-payment-confirmation', async (req, res) => {
    try {
        const { bookingId, guestEmail, guestName, paymentAmount, paymentMethod } = req.body;
    
        const booking = await bookingService.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

 
        const result = await emailService.sendPaymentConfirmation(booking, guestEmail);
        
        res.json({ 
            success: result.success, 
            message: result.success ? 'Payment confirmation email sent successfully' : 'Failed to send payment confirmation email',
            error: result.error
        });
    } catch (err) {
        console.error('Payment confirmation email error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

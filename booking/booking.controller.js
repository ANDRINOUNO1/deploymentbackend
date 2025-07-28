const express = require('express');
const router = express.Router();
const bookingService = require('./booking.service');

// POST /api/bookings
router.post('/', async (req, res) => {
    try {
        const bookings = await bookingService.createBooking(req.body);
        res.status(201).json(bookings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await bookingService.getAllBookings();
        res.json(bookings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/bookings/:id
router.put('/:id', async (req, res) => {
    try {
        const booking = await bookingService.updateBooking(req.params.id, req.body);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await bookingService.deleteBooking(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Booking not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

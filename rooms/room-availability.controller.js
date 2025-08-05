const express = require('express');
const router = express.Router();
const roomAvailabilityService = require('./room-availability.service');

// GET /api/room-availability/available - Get available rooms for date range
router.get('/available', async (req, res) => {
    try {
        const { checkIn, checkOut, roomTypeId } = req.query;
        
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'checkIn and checkOut dates are required' });
        }
        
        const availableRooms = await roomAvailabilityService.findAvailableRooms(
            checkIn, 
            checkOut, 
            roomTypeId ? parseInt(roomTypeId) : null
        );
        
        // Transform to frontend format
        const availabilityData = availableRooms.map(room => ({
            roomId: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType?.type || 'Unknown',
            isAvailable: true,
            occupancy: []
        }));
        
        res.json(availabilityData);
    } catch (err) {
        console.error('Error getting available rooms:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/room-availability/check/:roomId - Check if specific room is available
router.get('/check/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { checkIn, checkOut, excludeBookingId } = req.query;
        
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'checkIn and checkOut dates are required' });
        }
        
        const isAvailable = await roomAvailabilityService.checkRoomAvailability(
            parseInt(roomId),
            checkIn,
            checkOut,
            excludeBookingId ? parseInt(excludeBookingId) : null
        );
        
        res.json({ available: isAvailable });
    } catch (err) {
        console.error('Error checking room availability:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/room-availability/calendar - Get availability calendar
router.get('/calendar', async (req, res) => {
    try {
        const { startDate, endDate, roomTypeId } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }
        
        const calendar = await roomAvailabilityService.getRoomAvailabilityCalendar(
            startDate,
            endDate,
            roomTypeId ? parseInt(roomTypeId) : null
        );
        
        res.json(calendar);
    } catch (err) {
        console.error('Error getting availability calendar:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/room-availability/occupancy/:roomId - Get room occupancy
router.get('/occupancy/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { startDate, endDate } = req.query;
        
        const occupancy = await roomAvailabilityService.getRoomOccupancy(
            parseInt(roomId),
            startDate || null,
            endDate || null
        );
        
        res.json(occupancy);
    } catch (err) {
        console.error('Error getting room occupancy:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 

const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const Room = db.Room;
const RoomType = db.RoomType; 

// GET all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.findAll({
            include: {
                model: RoomType,
                attributes: ['type', 'description', 'basePrice'] 
            },
            order: [['roomNumber', 'ASC']]
        });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all room types (for frontend availability component)
router.get('/types', async (req, res) => {
    try {
        const roomTypes = await RoomType.findAll({
            order: [['id', 'ASC']]
        });
        res.json(roomTypes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET available rooms by type (for reservation system)
router.get('/available/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        const availableRooms = await Room.findAll({
            include: {
                model: RoomType,
                where: { type: type },
                attributes: ['type', 'description', 'basePrice']
            },
            where: { isAvailable: true },
            order: [['roomNumber', 'ASC']]
        });
        
        res.json(availableRooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET room statistics (for dashboard)
router.get('/stats', async (req, res) => {
    try {
        const totalRooms = await Room.count();
        const availableRooms = await Room.count({ where: { isAvailable: true } });
        const occupiedRooms = totalRooms - availableRooms;
        
        // Get room type distribution
        const roomTypeStats = await Room.findAll({
            include: {
                model: RoomType,
                attributes: ['type', 'basePrice']
            },
            attributes: ['isAvailable']
        });
        
        const stats = {
            total: totalRooms,
            available: availableRooms,
            occupied: occupiedRooms,
            occupancyRate: ((occupiedRooms / totalRooms) * 100).toFixed(2),
            roomTypes: {}
        };
        
        // Group by room type
        roomTypeStats.forEach(room => {
            const type = room.RoomType.type;
            if (!stats.roomTypes[type]) {
                stats.roomTypes[type] = {
                    total: 0,
                    available: 0,
                    occupied: 0,
                    price: room.RoomType.basePrice
                };
            }
            stats.roomTypes[type].total++;
            if (room.isAvailable) {
                stats.roomTypes[type].available++;
            } else {
                stats.roomTypes[type].occupied++;
            }
        });
        
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET room by id
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findByPk(req.params.id, {
            include: {
                model: RoomType,
                attributes: ['type', 'description', 'basePrice']
            }
        });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create room
router.post('/', async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update room
router.put('/:id', async (req, res) => {
    try {
        const room = await Room.findByPk(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        await room.update(req.body);
        res.json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update room availability (for booking system)
router.put('/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;
        
        const room = await Room.findByPk(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        await room.update({ isAvailable });
        
        res.json({ 
            message: `Room ${room.roomNumber} is now ${isAvailable ? 'available' : 'occupied'}`,
            room: room
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE room
router.delete('/:id', async (req, res) => {
    try {
        const room = await Room.findByPk(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        await room.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST bulk update room availability (for admin)
router.post('/bulk-availability', async (req, res) => {
    try {
        const { roomIds, isAvailable } = req.body;
        
        if (!Array.isArray(roomIds) || roomIds.length === 0) {
            return res.status(400).json({ message: 'Room IDs array is required' });
        }
        
        const updatedRooms = await Room.update(
            { isAvailable },
            { 
                where: { id: roomIds },
                returning: true
            }
        );
        
        res.json({ 
            message: `Updated ${updatedRooms[0]} rooms availability`,
            updatedCount: updatedRooms[0]
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

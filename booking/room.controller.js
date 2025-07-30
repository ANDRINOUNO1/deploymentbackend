// booking/room.controller.js
const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const Room = db.Room;
const RoomType = db.RoomType; // Import RoomType model

// GET all rooms
router.get('/', async (req, res) => {
    try {
        // Include the RoomType model to fetch associated room type data
        const rooms = await Room.findAll({
            include: {
                model: RoomType,
                attributes: ['type'] // Only fetch the 'type' attribute from RoomType
            }
        });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET room by id
router.get('/:id', async (req, res) => {
    try {
        // Include the RoomType model when fetching a single room
        const room = await Room.findByPk(req.params.id, {
            include: {
                model: RoomType,
                attributes: ['type']
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

module.exports = router;

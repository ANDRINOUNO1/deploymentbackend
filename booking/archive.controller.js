const express = require('express');
const router = express.Router();
const archiveService = require('./archive.service');

// POST /api/archives
router.post('/', async (req, res) => {
    try {
        const archive = await archiveService.createArchive(req.body);
        res.status(201).json(archive);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/archives
router.get('/', async (req, res) => {
    try {
        const archives = await archiveService.getAllArchives();
        res.json(archives);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/archives/:id
router.get('/:id', async (req, res) => {
    try {
        const archive = await archiveService.getArchiveById(req.params.id);
        if (!archive) return res.status(404).json({ message: 'Archived booking not found' });
        res.json(archive);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/archives/:id
router.put('/:id', async (req, res) => {
    try {
        const updated = await archiveService.updateArchive(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Archived booking not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/archives/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await archiveService.deleteArchive(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Archived booking not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

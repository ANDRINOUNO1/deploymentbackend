const express = require('express');
const router = express.Router();
const accountService = require('./account.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', revokeToken);

module.exports = router;

function authenticate(req, res, next) {
    accountService.authenticate({ ...req.body, ipAddress: req.ip })
        .then(account => res.json(account))
        .catch(err => res.status(400).json({ message: err.toString() }));
}

function register(req, res, next) {
    accountService.register(req.body)
        .then(account => res.status(201).json(account))
        .catch(err => res.status(400).json({ message: err.toString() }));
}

function getAll(req, res, next) {
    accountService.getAll()
        .then(accounts => res.json(accounts))
        .catch(next);
}

function getById(req, res, next) {
    accountService.getById(req.params.id)
        .then(account => account ? res.json(account) : res.status(404).json({ message: 'Account not found' }))
        .catch(next);
}

function update(req, res, next) {
    accountService.update(req.params.id, req.body)
        .then(account => res.json(account))
        .catch(err => res.status(400).json({ message: err.toString() }));
}

function _delete(req, res, next) {
    accountService.delete(req.params.id)
        .then(() => res.status(204).send())
        .catch(err => res.status(400).json({ message: err.toString() }));
}

function refreshToken(req, res, next) {
    accountService.refreshToken({ ...req.body, ipAddress: req.ip })
        .then(account => res.json(account))
        .catch(err => res.status(400).json({ message: err.toString() }));
}

function revokeToken(req, res, next) {
    accountService.revokeToken({ ...req.body, ipAddress: req.ip })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(err => res.status(400).json({ message: err.toString() }));
}

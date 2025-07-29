const express = require('express');
const router = express.Router();
const accountService = require('./account.service');
const authorize = require('../_middleware/authorize'); // Import authorize middleware
const Role = require('../_helpers/role'); // Import Role enum

// routes
router.post('/authenticate', authenticate); // Public route
router.post('/register', register);         // Public route
router.get('/', authorize([Role.Admin, Role.SuperAdmin]), getAll); // Admins and SuperAdmins can view all accounts
router.get('/:id', authorize(), getById); // Authenticated users can view their own, Admin/SuperAdmin can view any
router.put('/:id', authorize(), update); // Authenticated users can update their own, Admin/SuperAdmin can update any
router.delete('/:id', authorize(Role.SuperAdmin), _delete); // Only SuperAdmins can delete accounts
router.post('/refresh-token', refreshToken); // Public route
router.post('/revoke-token', revokeToken);   // Public route

// Test route to verify server is running latest code
router.get('/test', (req, res) => {
    res.send('Account controller is working!');
});

module.exports = router;

function authenticate(req, res, next) {
    accountService.authenticate({ ...req.body, ipAddress: req.ip }) // Pass ipAddress
        .then(account => res.json(account))
        .catch(err => res.status(400).json({ message: err.toString() }));
}

function register(req, res, next) {
    accountService.register(req.body)
        .then(account => res.status(201).json(account))
        .catch(err => res.status(400).json({ message: err.toString() }));
}

function getAll(req, res, next) {
    const status = req.query.status;
    accountService.getAll(status)
        .then(accounts => res.json(accounts))
        .catch(next);
}

function getById(req, res, next) {
    // Logic to ensure a user can only view their own account unless they are Admin/SuperAdmin
    accountService.getById(req.params.id)
        .then(account => {
            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }
            // Allow if user is an Admin/SuperAdmin or if they are requesting their own account
            if (req.user.role === Role.Admin || req.user.role === Role.SuperAdmin || req.user.id === account.id) {
                return res.json(account);
            } else {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        })
        .catch(next);
}

function update(req, res, next) {
    // Logic to ensure a user can only update their own account unless they are Admin/SuperAdmin
    accountService.update(req.params.id, req.body)
        .then(account => {
            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }
            // Allow if user is an Admin/SuperAdmin or if they are updating their own account
            if (req.user.role === Role.Admin || req.user.role === Role.SuperAdmin || req.user.id === account.id) {
                return res.json(account);
            } else {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        })
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
const { expressjwt } = require('express-jwt');
const config = require('../config.json');
const db = require('../_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
 
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        expressjwt({ secret: config.secret, algorithms: ['HS256'] }),

        async (req, res, next) => {
            try {
                const account = await db.Account.findByPk(req.auth.id);

                if (!account) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                if (account.status !== 'Active') {
                    return res.status(403).json({ message: 'Account is inactive or in pending. Please contact support.' });
                }

                if (roles.length && !roles.includes(account.role)) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                req.user = account;
                next();
            } catch (error) {
                
                console.error('Authorization error:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        },
        (req, res, next) => {
            console.log('Authorize middleware user:', req.user);
            next();
        }
    ];
} 
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = (roles = []) => {
    return (req, res, next) => {
        try {
            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                throw new UnauthorizedError('No token provided');
            }

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;

            // Check role if roles are specified
            if (roles.length && !roles.includes(decoded.role)) {
                throw new UnauthorizedError('Insufficient permissions');
            }

            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                next(new UnauthorizedError('Invalid token'));
            } else if (error.name === 'TokenExpiredError') {
                next(new UnauthorizedError('Token expired'));
            } else {
                next(error);
            }
        }
    };
};

// Role-based middleware helpers
const ownerOnly = auth(['owner']);
const managerOnly = auth(['manager']);
const ownerOrManager = auth(['owner', 'manager']);

module.exports = {
    auth,
    ownerOnly,
    managerOnly,
    ownerOrManager
};

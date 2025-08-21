const jwt = require('jsonwebtoken');


/**
* Generates a JWT for a given payload (e.g. user id and role).
* Returns the signed token string.
*/
function generateToken(payload) {
    // Keep payload small (id, role, maybe email)
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}


/**
* Express middleware to authenticate JWT from Authorization header.
* Attaches `req.user` when valid, otherwise responds 401.
*/
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.warn('JWT verification failed', err);    
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        req.user = decoded; // decoded typically contains id, role, iat, exp
        next();
    });
}


/**
* Role-based authorization middleware. Accepts one or more allowed roles.
* Usage: authorizeRoles('Admin') or authorizeRoles('Admin', 'HR')
*/
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Forbidden: role not found' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
        }
        
        next();
    };
}


module.exports = {
    generateToken,
    authenticateJWT,
    authorizeRoles,
};
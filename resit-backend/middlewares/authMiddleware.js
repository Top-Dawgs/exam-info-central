const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get token from "Bearer TOKEN"

    if (!token) return res.status(401).json({ error: 'Token missing'}); 

    jwt.verify(token, 'mySuperSecretKey123', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });

        req.user = user; //{userId, role}
        next();
    });

}

module.exports = authenticateToken;
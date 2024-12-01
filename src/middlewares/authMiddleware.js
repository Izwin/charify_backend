import admin from 'firebase-admin';
import User from '../models/User.js';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({ uid: decodedToken.uid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = {
            _id: user._id,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: user.createdAt,
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }
};

export default authenticateToken;

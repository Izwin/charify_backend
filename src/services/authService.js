import admin from '../firebase.js';
import User from '../models/User.js';

export async function verifyGoogleToken(token) {
    try {
        return await admin.auth().verifyIdToken(token);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

export async function findOrCreateUser(userData) {
    const { uid, email, name, picture } = userData;

    let user = await User.findOne({ uid });

    if (!user) {
        user = new User({
            uid,
            email,
            displayName: name || 'Unknown',
            photoURL: picture || null,
        });

        await user.save();
    }

    return user;
}

import { verifyGoogleToken, findOrCreateUser } from '../services/authService.js';
import Donation from '../models/Donation.js';

export async function verify(req, res) {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        const decodedToken = await verifyGoogleToken(token);

        const user = await findOrCreateUser({
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture,
        });

        const totalDonated = await Donation.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]).then(result => (result.length ? result[0].total : 0));

        const projectsSupported = await Donation.distinct('application', { user: user._id }).then(
            projects => projects.length
        );

        res.status(200).json({
            userId: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: user.createdAt,
            totalDonated,
            projectsSupported,
        });
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = req.user;

        const totalDonated = await Donation.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]).then(result => (result.length ? result[0].total : 0));

        const projectsSupported = await Donation.distinct('application', { user: user._id }).then(
            projects => projects.length
        );

        res.status(200).json({
            userId: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: user.createdAt,
            totalDonated,
            projectsSupported,
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

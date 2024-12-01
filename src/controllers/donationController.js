import Donation from '../models/Donation.js';

const getUserDonations = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(400).json({ message: 'User ID is missing in the request.' });

        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        if (isNaN(pageNumber) || isNaN(pageSize)) return res.status(400).json({ message: 'Invalid pagination parameters' });

        const filter = { user: userId };
        const donations = await Donation.find(filter)
            .populate('user')
            .populate('application')
            .sort({ date: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        const totalDonations = await Donation.countDocuments(filter);
        const totalPages = totalDonations > 0 ? Math.ceil(totalDonations / pageSize) : 1;

        res.status(200).json({ donations, currentPage: pageNumber, totalPages, totalDonations });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching donations', error: err.message });
    }
};

export { getUserDonations };

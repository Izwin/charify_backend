import Category from '../models/Category.js';

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().lean();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories', error: err.message });
    }
};

export { getCategories };

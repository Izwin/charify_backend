import Application from '../models/Application.js';
import Donation from '../models/Donation.js';
import { createPaymentIntent } from '../services/stripeService.js';
import multer from "multer";
import * as path from "node:path";

const createApplication = async (req, res) => {
    try {
        const { title, description, amount, deadline, category, urgent } = req.body;

        if (!title || !description || !amount || !deadline || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let images = [];
        if (req.files) {
            images = req.files.map(file => path.basename(file.path));
        }

        const newApplication = new Application({
            title,
            description,
            amount,
            deadline,
            category,
            urgent,
            images,
        });

        await newApplication.save();
        res.status(201).json(newApplication);
    } catch (err) {
        res.status(500).json({ message: 'Error creating application', error: err.message });
    }
};

const getApplications = async (req, res) => {
    try {
        const { category, urgent, status, page = 1, limit = 10, search = '' } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));

        const filter = {};
        if (category) filter.category = category;
        if (urgent) filter.urgent = urgent;
        if (status) filter.status = status;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const skip = (pageNum - 1) * limitNum;

        const applications = await Application.find(filter)
            .skip(skip)
            .limit(limitNum)
            .populate('category')
            .lean();

        const applicationsWithStats = await Promise.all(
            applications.map(async (application) => {
                const donorCount = await Donation.distinct('user', { application: application._id }).then(donors => donors.length);
                const collectedAmount = await Donation.aggregate([
                    { $match: { application: application._id } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]).then(result => (result.length ? result[0].total : 0));

                const collectedPercentage = application.amount > 0 ? (collectedAmount / application.amount) * 100 : 0;

                return {
                    ...application,
                    donorCount,
                    collectedPercentage: Number(collectedPercentage.toFixed(2)),
                };
            })
        );

        const totalApplications = await Application.countDocuments(filter);

        res.status(200).json({
            total: totalApplications,
            page: pageNum,
            pages: Math.ceil(totalApplications / limitNum),
            applications: applicationsWithStats,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching applications', error: err.message });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('category')
            .lean();

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const donorCount = await Donation.distinct('user', { application: application._id }).then(donors => donors.length);
        const collectedAmount = await Donation.aggregate([
            { $match: { application: application._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]).then(result => (result.length ? result[0].total : 0));

        const collectedPercentage = application.amount > 0 ? (collectedAmount / application.amount) * 100 : 0;

        let userDonations = [];
        const userId = req.user._id.toString();
        userDonations = await Donation.find({ application: application._id, user: userId })
            .select('-application')
            .lean();

        res.status(200).json({
            ...application,
            donorCount,
            collectedAmount,
            collectedPercentage: Number(collectedPercentage.toFixed(2)),
            userDonations,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching application', error: err.message });
    }
};

export { createApplication, getApplications, getApplicationById };

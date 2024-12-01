import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    commission: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

export default mongoose.model('Donation', donationSchema);

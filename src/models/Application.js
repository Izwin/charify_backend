import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount must be a positive number'],
        },
        deadline: {
            type: Date,
            required: [true, 'Deadline is required'],
        },
        status: {
            type: String,
            enum: {
                values: ['completed', 'inProgress'],
                message: 'Status must be either "completed" or "inProgress"',
            },
            default: 'inProgress',
        },
        urgent: {
            type: Boolean,
            default: false,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        images: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Application', applicationSchema);

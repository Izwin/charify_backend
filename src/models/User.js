import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        uid: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        displayName: { type: String, required: true },
        photoURL: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);

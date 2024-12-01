import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './database/connect.js';
import applicationRoutes from './routes/applicationRoutes.js';
import paymentRoutes from './routes/payment.js';
import donationRoutes from './routes/donationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import stripeWebhookRoutes from './routes/stripeWebhook.js';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Application from './models/Application.js';
import Donation from './models/Donation.js';
import path from 'path';
import { fileURLToPath } from 'url';
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();
connectDB();

AdminJS.registerAdapter(AdminJSMongoose);

const adminJs = new AdminJS({
    resources: [User, Application, Category, Donation],
    rootPath: '/admin',
    branding: { companyName: 'CharityApp Admin', softwareBrothers: false },
});

app.use(adminJs.options.rootPath, AdminJSExpress.buildRouter(adminJs));
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/payments', paymentRoutes);
app.use(stripeWebhookRoutes);

app.listen(3000, () => console.log('Server is running on port 3000'));

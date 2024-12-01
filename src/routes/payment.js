import express from 'express';
import stripe from 'stripe';
import authenticateToken from '../middlewares/authMiddleware.js';
import { createPaymentIntent } from '../services/stripeService.js';

const router = express.Router();
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', authenticateToken, createPaymentIntent);

export default router;

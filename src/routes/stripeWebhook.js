import express from 'express';
import stripe from 'stripe';
import Donation from '../models/Donation.js';

const router = express.Router();
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        const sig = req.headers['stripe-signature'];

        try {
            const event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);

            switch (event.type) {
                case 'payment_intent.succeeded': {
                    const { userId, applicationId, commission, totalAmount } = event.data.object.metadata;
                    const donationAmount = totalAmount - commission;

                    const donation = new Donation({
                        user: userId,
                        application: applicationId,
                        amount: parseFloat(donationAmount),
                        commission: parseFloat(commission),
                        totalAmount: parseFloat(totalAmount),
                    });

                    await donation.save();
                    console.log(`PaymentIntent for donation ${donation.amount} was successful!`);
                    break;
                }

                case 'payment_intent.failed':
                    console.log(`PaymentIntent failed for ${event.data.object.id}`);
                    break;

                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            res.status(200).send('Event received');
        } catch (err) {
            console.error('Webhook Error:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
);

export default router;

import Stripe from 'stripe';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
    try {
        const { amount, applicationId } = req.body;
        if (!amount || !applicationId) return res.status(400).json({ message: 'Missing required parameters' });

        const userId = req.user._id;
        const commission = Math.round(amount * 0.05 * 100) / 100;
        const totalAmount = amount + commission;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            metadata: {
                userId: userId.toString(),
                applicationId,
                commission,
                totalAmount,
            },
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Error creating PaymentIntent:', err.message);
        res.status(500).json({ message: 'Error creating PaymentIntent', error: err.message });
    }
};

const handleStripeWebhook = (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'payment_intent.succeeded') {
            console.log('Payment succeeded:', event.data.object);
        }

        res.status(200).send('Event received');
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

export { createPaymentIntent, handleStripeWebhook };

const asyncHandler = require('../middleware/asyncHandler');
const stripe = require('../config/stripe');
const Order = require('../models/Order');

// @desc    Create a Stripe PaymentIntent for an existing order
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized for this order');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  // Stripe expects the amount in the smallest currency unit (cents)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100),
    currency: 'usd',
    metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

// @desc    Stripe webhook — confirms payment and marks order as paid
// @route   POST /api/payments/webhook
// @access  Public (verified via Stripe signature)
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be the raw buffer here — see server.js route config
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { orderId } = paymentIntent.metadata;

    const order = await Order.findById(orderId);
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'processing';
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: new Date().toISOString(),
        emailAddress: paymentIntent.receipt_email || '',
      };
      await order.save();
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    console.warn('Payment failed for intent:', paymentIntent.id);
  }

  res.json({ received: true });
});

module.exports = { createPaymentIntent, stripeWebhook };
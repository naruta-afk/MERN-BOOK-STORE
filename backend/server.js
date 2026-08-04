const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { stripeWebhook } = require('./controllers/paymentController');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Stripe webhook MUST come before express.json() — it needs the raw body
// to verify the signature, otherwise verification will always fail.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
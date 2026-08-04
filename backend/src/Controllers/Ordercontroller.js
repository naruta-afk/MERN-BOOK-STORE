const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const orderItems = cart.items.map((item) => ({
    book: item.book._id,
    title: item.book.title,
    quantity: item.quantity,
    price: item.price,
  }));

  const itemsPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxPrice = Number((itemsPrice * 0.1).toFixed(2));
  const shippingPrice = itemsPrice > 50 ? 0 : 5.99;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  // Verify stock before committing the order
  for (const item of cart.items) {
    if (item.book.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${item.book.title}"`);
    }
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Decrement stock and clear cart
  for (const item of cart.items) {
    await Book.findByIdAndUpdate(item.book._id, { $inc: { stock: -item.quantity } });
  }
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort('-createdAt');
  res.json(orders);
});

// @desc    Update order status / payment / delivery
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = req.body.status || order.status;

  if (req.body.status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
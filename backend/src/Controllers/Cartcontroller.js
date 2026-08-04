const asyncHandler = require('../middleware/asyncHandler');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.book', 'title price coverImage stock');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.json(cart);
});

// @desc    Add item to cart (or bump quantity if it exists)
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { bookId, quantity = 1 } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  if (book.stock < quantity) {
    res.status(400);
    throw new Error('Not enough stock available');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find((item) => item.book.toString() === bookId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ book: bookId, quantity, price: book.discountPrice || book.price });
  }

  await cart.save();
  res.status(201).json(cart);
});

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/:bookId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((i) => i.book.toString() === req.params.bookId);
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  item.quantity = quantity;
  await cart.save();
  res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
  await cart.save();
  res.json(cart);
});

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
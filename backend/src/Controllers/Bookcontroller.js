const asyncHandler = require('../middleware/asyncHandler');
const Book = require('../models/Book');

// @desc    Get all books (search, filter, paginate)
// @route   GET /api/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const filter = { isActive: true };

  if (req.query.keyword) {
    filter.$text = { $search: req.query.keyword };
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  const count = await Book.countDocuments(filter);
  const books = await Book.find(filter)
    .populate('category', 'name slug')
    .sort(req.query.sort || '-createdAt')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ books, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate('category', 'name slug');

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  res.json(book);
});

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
const getFeaturedBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ isFeatured: true, isActive: true }).limit(8);
  res.json(books);
});

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json(book);
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  Object.assign(book, req.body);
  const updatedBook = await book.save();
  res.json(updatedBook);
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  await book.deleteOne();
  res.json({ message: 'Book removed' });
});

module.exports = {
  getBooks,
  getBookById,
  getFeaturedBooks,
  createBook,
  updateBook,
  deleteBook,
};
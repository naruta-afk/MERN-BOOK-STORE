const asyncHandler = require('../middleware/asyncHandler');
const Review = require('../models/Review');

// @desc    Get reviews for a book
// @route   GET /api/books/:bookId/reviews
// @access  Public
const getBookReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId })
    .populate('user', 'name')
    .sort('-createdAt');
  res.json(reviews);
});

// @desc    Add a review to a book
// @route   POST /api/books/:bookId/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const alreadyReviewed = await Review.findOne({
    book: req.params.bookId,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You already reviewed this book');
  }

  const review = await Review.create({
    user: req.user._id,
    book: req.params.bookId,
    rating,
    comment,
  });

  res.status(201).json(review);
});

// @desc    Delete a review (owner or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const bookId = review.book;
  await review.deleteOne();
  await Review.recalculateBookRating(bookId);

  res.json({ message: 'Review removed' });
});

module.exports = { getBookReviews, createReview, deleteReview };
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getBooks,
  getBookById,
  getFeaturedBooks,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { getBookReviews, createReview } = require('../controllers/reviewController');

router.get('/', getBooks);
router.get('/featured', getFeaturedBooks);
router.post('/', protect, admin, createBook);

router
  .route('/:id')
  .get(getBookById)
  .put(protect, admin, updateBook)
  .delete(protect, admin, deleteBook);

// Nested review routes: /api/books/:bookId/reviews
router.route('/:bookId/reviews').get(getBookReviews).post(protect, createReview);

module.exports = router;
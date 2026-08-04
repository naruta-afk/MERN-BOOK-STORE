const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { deleteReview } = require('../controllers/reviewController');

router.delete('/:id', protect, deleteReview);

module.exports = router;
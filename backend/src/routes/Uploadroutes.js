const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
} = require('../controllers/uploadController');

router.post('/single', protect, admin, upload.single('image'), uploadSingleImage);
router.post('/multiple', protect, admin, upload.array('images', 6), uploadMultipleImages);
router.delete('/', protect, admin, deleteImage);

module.exports = router;
const asyncHandler = require('../middleware/asyncHandler');
const cloudinary = require('../config/cloudinary');

// @desc    Upload a single image (e.g. cover image)
// @route   POST /api/uploads/single
// @access  Private/Admin
const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  res.status(201).json({
    url: req.file.path, // secure_url from Cloudinary
    publicId: req.file.filename, // Cloudinary public_id, needed for deletion
  });
});

// @desc    Upload multiple images (e.g. book gallery)
// @route   POST /api/uploads/multiple
// @access  Private/Admin
const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No image files provided');
  }

  const images = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  res.status(201).json(images);
});

// @desc    Delete an uploaded image from Cloudinary
// @route   DELETE /api/uploads/:publicId
// @access  Private/Admin
const deleteImage = asyncHandler(async (req, res) => {
  // publicId may contain slashes (folder path), so it's passed as a query param
  const publicId = req.query.publicId;

  if (!publicId) {
    res.status(400);
    throw new Error('publicId is required');
  }

  const result = await cloudinary.uploader.destroy(publicId);
  res.json({ result });
});

module.exports = { uploadSingleImage, uploadMultipleImages, deleteImage };
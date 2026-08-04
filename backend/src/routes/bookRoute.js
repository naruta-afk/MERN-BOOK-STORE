const express = require('express');
const router = express.Router();

const{protect} = require('../middleware/authMiddleware.js');
const {deleteRevie} = require('../controllers/reviewController.js');

router.delete('/:id', protect, deleteRevie);

module.exports = router;


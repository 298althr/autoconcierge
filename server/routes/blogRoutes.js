const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', blogController.getPosts);
router.get('/:slug', blogController.getPostBySlug);

// Admin routes
router.post('/', protect, admin, blogController.createPost);
router.patch('/:id', protect, admin, blogController.updatePost);
router.delete('/:id', protect, admin, blogController.deletePost);

module.exports = router;

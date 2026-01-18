const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');

// GET /api/blog - Get all blog posts
router.get('/', blogController.getAllPosts);

// GET /api/blog/categories - Get all categories
router.get('/categories', blogController.getCategories);

// GET /api/blog/:slug - Get single blog post
router.get('/:slug', blogController.getPostBySlug);

module.exports = router;

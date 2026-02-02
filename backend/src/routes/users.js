const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMe, updateMe, getUserById, getUserEntries } = require('../controllers/userController');

// Protected routes (require authentication)
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

// Public routes (anyone can view user profiles)
router.get('/:id', getUserById);
router.get('/:id/entries', getUserEntries);

module.exports = router;
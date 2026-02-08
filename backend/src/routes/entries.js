const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getMyEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
} = require('../controllers/entryController');

// All entry routes require authentication
router.get('/', authMiddleware, getMyEntries);
router.post('/', authMiddleware, createEntry);
router.get('/:id', authMiddleware, getEntryById);
router.put('/:id', authMiddleware, updateEntry);
router.delete('/:id', authMiddleware, deleteEntry);

module.exports = router;
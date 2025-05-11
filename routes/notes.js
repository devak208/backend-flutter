const express = require('express');
const { body } = require('express-validator');
const notesController = require('../controllers/notes');
const isAuth = require('../middleware/auth');

const router = express.Router();

// Protect all routes in this file with authentication
router.use(isAuth);

// GET /api/notes
router.get('/', notesController.getNotes);

// POST /api/notes/reorder
router.post(
  '/reorder',
  [
    body('sourceId')
      .isMongoId()
      .withMessage('Invalid source note ID'),
    body('targetId')
      .isMongoId()
      .withMessage('Invalid target note ID')
  ],
  notesController.reorderNotes
);

// GET /api/notes/:noteId
router.get('/:noteId', notesController.getNote);

// POST /api/notes
router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Title is required'),
    body('blocks')
      .isArray()
      .optional()
  ],
  notesController.createNote
);

// PUT /api/notes/:noteId
router.put(
  '/:noteId',
  [
    body('title')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Title is required'),
    body('blocks')
      .isArray()
  ],
  notesController.updateNote
);

// DELETE /api/notes/:noteId
router.delete('/:noteId', notesController.deleteNote);

// PATCH /api/notes/:noteId/favorite
router.patch('/:noteId/favorite', notesController.toggleFavorite);

// PATCH /api/notes/:noteId/archive
router.patch('/:noteId/archive', notesController.toggleArchive);

module.exports = router;
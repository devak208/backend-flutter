const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Note = require('../models/note');

// Get all notes for current user
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ 
      user: req.userId,
      isArchived: false 
    }).sort({ updatedAt: -1 });
    
    res.status(200).json({
      message: 'Notes fetched successfully',
      notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Fetching notes failed.' });
    next(error);
  }
};

// Get a single note by ID
exports.getNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    
    const note = await Note.findOne({ 
      _id: noteId,
      user: req.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    
    res.status(200).json({
      message: 'Note fetched successfully',
      note
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Fetching note failed.' });
    next(error);
  }
};

// Create a new note
exports.createNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    
    const { title, blocks } = req.body;
    
    // Create new note
    const note = new Note({
      title,
      blocks: blocks || [],
      user: req.userId
    });
    
    await note.save();
    
    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Creating note failed.' });
    next(error);
  }
};

// Update an existing note
exports.updateNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const { title, blocks } = req.body;
    
    // Find and update note
    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: req.userId },
      { title, blocks, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized.' });
    }
    
    res.status(200).json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Updating note failed.' });
    next(error);
  }
};

// Delete a note
exports.deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    
    // Find and delete note
    const note = await Note.findOneAndDelete({ 
      _id: noteId, 
      user: req.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized.' });
    }
    
    res.status(200).json({
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Deleting note failed.' });
    next(error);
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    
    const note = await Note.findOne({ 
      _id: noteId, 
      user: req.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized.' });
    }
    
    note.isFavorite = !note.isFavorite;
    await note.save();
    
    res.status(200).json({
      message: `Note ${note.isFavorite ? 'added to' : 'removed from'} favorites`,
      note
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Toggling favorite failed.' });
    next(error);
  }
};

// Archive/Unarchive a note
exports.toggleArchive = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    
    const note = await Note.findOne({ 
      _id: noteId, 
      user: req.userId 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized.' });
    }
    
    note.isArchived = !note.isArchived;
    await note.save();
    
    res.status(200).json({
      message: `Note ${note.isArchived ? 'archived' : 'unarchived'}`,
      note
    });
  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({ message: 'Toggling archive failed.' });
    next(error);
  }
};

// Reorder notes
exports.reorderNotes = async (req, res, next) => {
  try {
    const { sourceId, targetId } = req.body;
    
    // Ensure both notes exist and belong to the user
    const sourceNote = await Note.findOne({ _id: sourceId, user: req.userId });
    const targetNote = await Note.findOne({ _id: targetId, user: req.userId });
    
    if (!sourceNote || !targetNote) {
      return res.status(404).json({ message: 'One or both notes not found or not authorized.' });
    }
    
    // In a more complex implementation, you would store order information
    // and handle the reordering here. For this example, we'll just
    // update the timestamps to simulate reordering
    
    // Update timestamps to represent new order
    const now = new Date();
    targetNote.updatedAt = now;
    sourceNote.updatedAt = new Date(now.getTime() + 1000); // 1 second later
    
    await Promise.all([targetNote.save(), sourceNote.save()]);
    
    res.status(200).json({
      message: 'Notes reordered successfully'
    });
  } catch (error) {
    console.error('Reorder notes error:', error);
    res.status(500).json({ message: 'Reordering notes failed.' });
    next(error);
  }
};
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteBlockSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'heading', 'checkbox', 'code', 'image']
  },
  content: {
    type: Map,
    of: Schema.Types.Mixed,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
}, { _id: true, timestamps: false });

const noteSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  blocks: [noteBlockSchema],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster queries
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, title: 'text' });

module.exports = mongoose.model('Note', noteSchema);
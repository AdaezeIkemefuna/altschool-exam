const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A Blog must have a name'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'A Blog must have a description'],
    },
    tags: {
      type: String,
      required: [true, 'A Blog must have a tags'],
    },

    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now(),
    },
    state: {
      type: String,
      default: 'draft',
      enum: ['draft', 'published'],
    },
    read_count: {
      type: Number,
      default: 0,
    },

    reading_time: {
      type: Date,
      default: Date.now(),
    },
    body: {
      type: String,
      trim: true,
    },
  },
  {
    toJSON: { virtual: true },
    toObject: { virtual: true },
  }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

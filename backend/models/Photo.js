// server/models/Photo.js
const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Inventory', 'Shipments']
  },
  date: {
    type: Date,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Photo', photoSchema);
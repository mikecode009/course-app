const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  rating: { type: Number, default: 0 },
  comments: [{ user: String, text: String, rating: Number }]
});

module.exports = mongoose.model('Course', courseSchema);

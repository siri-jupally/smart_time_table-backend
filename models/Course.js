const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  minPeriods: { type: Number, required: true },
  maxPeriods: { type: Number, required: true },
  isLab: { type: Boolean, default: false },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }]
});

module.exports = mongoose.model('Course', courseSchema); 
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  availability: {
    monday: [{ type: Boolean }],
    tuesday: [{ type: Boolean }],
    wednesday: [{ type: Boolean }],
    thursday: [{ type: Boolean }],
    friday: [{ type: Boolean }]
  },
  maxWorkload: { type: Number, required: true }
});

module.exports = mongoose.model('Teacher', teacherSchema); 
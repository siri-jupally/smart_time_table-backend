const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const periodSchema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  classroom: { type: Schema.Types.ObjectId, ref: 'Classroom' }
});

const daySchema = new Schema({
  periods: [periodSchema]
});

const timetableSchema = new Schema({
  section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema); 
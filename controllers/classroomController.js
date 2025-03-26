const Classroom = require('../models/Classroom');

// Get all classrooms
exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new classroom
exports.createClassroom = async (req, res) => {
  try {
    const classroom = new Classroom(req.body);
    const newClassroom = await classroom.save();
    res.status(201).json(newClassroom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get classroom by ID
exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.status(200).json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update classroom
exports.updateClassroom = async (req, res) => {
  try {
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClassroom) return res.status(404).json({ message: 'Classroom not found' });
    res.status(200).json(updatedClassroom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete classroom
exports.deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.status(200).json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// Get all timetables
router.get('/', timetableController.getAllTimetables);

// Get timetable by section
router.get('/section/:sectionId', timetableController.getTimetableBySection);

// Generate timetables
router.post('/generate', timetableController.generateTimetables);

module.exports = router; 
const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');

router.get('/', classroomController.getAllClassrooms);
router.post('/', classroomController.createClassroom);
router.get('/:id', classroomController.getClassroomById);
router.put('/:id', classroomController.updateClassroom);
router.delete('/:id', classroomController.deleteClassroom);

module.exports = router; 
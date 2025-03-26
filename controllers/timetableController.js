const Timetable = require('../models/Timetable');
const Section = require('../models/Section');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const timetableGenerator = require('../utils/timetableGenerator');

// Generate timetables
exports.generateTimetables = async (req, res) => {
  try {
    // Check if we have the necessary data
    const teachersCount = await Teacher.countDocuments();
    const coursesCount = await Course.countDocuments();
    const classroomsCount = await Classroom.countDocuments();
    const sectionsCount = await Section.countDocuments();
    
    if (teachersCount === 0 || coursesCount === 0 || classroomsCount === 0 || sectionsCount === 0) {
      return res.status(400).json({ 
        message: 'Cannot generate timetable. Missing required data.',
        details: {
          teachers: teachersCount,
          courses: coursesCount,
          classrooms: classroomsCount,
          sections: sectionsCount
        }
      });
    }
    
    // Clear existing timetables
    await Timetable.deleteMany({});
    
    // Generate new timetables
    const timetables = await timetableGenerator.generateTimetable();
    
    // Fetch the newly created timetables with populated data
    const populatedTimetables = await Timetable.find()
      .populate('section')
      .populate({
        path: 'monday.periods.course tuesday.periods.course wednesday.periods.course thursday.periods.course friday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'monday.periods.teacher tuesday.periods.teacher wednesday.periods.teacher thursday.periods.teacher friday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'monday.periods.classroom tuesday.periods.classroom wednesday.periods.classroom thursday.periods.classroom friday.periods.classroom',
        model: 'Classroom'
      });
    
    res.status(200).json({ 
      message: 'Timetables generated successfully', 
      count: timetables.length,
      timetables: populatedTimetables
    });
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// Get all timetables
exports.getAllTimetables = async (req, res) => {
  try {
    console.log('Fetching all timetables...');
    const timetables = await Timetable.find()
      .populate('section')
      .populate({
        path: 'monday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'tuesday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'wednesday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'thursday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'friday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'monday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'tuesday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'wednesday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'thursday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'friday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'monday.periods.classroom',
        model: 'Classroom'
      })
      .populate({
        path: 'tuesday.periods.classroom',
        model: 'Classroom'
      })
      .populate({
        path: 'wednesday.periods.classroom',
        model: 'Classroom'
      })
      .populate({
        path: 'thursday.periods.classroom',
        model: 'Classroom'
      })
      .populate({
        path: 'friday.periods.classroom',
        model: 'Classroom'
      });
    
    console.log('Timetables fetched:', timetables.length);
    // Log the structure of the first timetable for debugging
    if (timetables.length > 0) {
      console.log('First timetable structure:', JSON.stringify(timetables[0], null, 2).substring(0, 500) + '...');
    }
    
    res.status(200).json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get timetable by section
exports.getTimetableBySection = async (req, res) => {
  try {
    console.log(`Fetching timetable for section: ${req.params.sectionId}`);
    const timetable = await Timetable.findOne({ section: req.params.sectionId })
      .populate('section')
      .populate({
        path: 'monday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'tuesday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'wednesday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'thursday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'friday.periods.course',
        model: 'Course'
      })
      .populate({
        path: 'monday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'tuesday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'wednesday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'thursday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'friday.periods.teacher',
        model: 'Teacher'
      })
      .populate({
        path: 'monday.periods.classroom',
        model: 'Classroom'
      })
      .populate({
        path: 'tuesday.periods.classroom',
        model: 'Classroom'
      })
      .populate({
        path: 'wednesday.periods.classroom',
        model: 'Classroom'
      })
      .populate({
        path: 'thursday.periods.classroom',
        model: 'Classroom'
      })
      .populate({
        path: 'friday.periods.classroom',
        model: 'Classroom'
      });
    
    if (!timetable) {
      console.log(`Timetable not found for section: ${req.params.sectionId}`);
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    console.log('Timetable found and populated');
    res.status(200).json(timetable);
  } catch (error) {
    console.error('Error fetching timetable by section:', error);
    res.status(500).json({ message: error.message });
  }
}; 
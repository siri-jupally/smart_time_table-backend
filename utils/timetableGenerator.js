const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
const Section = require('../models/Section');
const Timetable = require('../models/Timetable');

// Constants
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const PERIODS_PER_DAY = 8;

// Helper function to check if a teacher is available
const isTeacherAvailable = (teacher, day, period) => {
  return teacher.availability[day][period];
};

// Helper function to check if a classroom is available in the current allocation
const isClassroomAvailable = (allocatedSlots, classroom, day, period) => {
  return !allocatedSlots[day][period].some(slot => 
    slot.classroom.toString() === classroom._id.toString()
  );
};

// Helper function to check if a teacher is already allocated in the current allocation
const isTeacherAllocated = (allocatedSlots, teacher, day, period) => {
  return allocatedSlots[day][period].some(slot => 
    slot.teacher.toString() === teacher._id.toString()
  );
};

// Helper function to distribute courses evenly across the week
const getPreferredDays = (courseAllocations) => {
  // Count allocations per day
  const dayCount = {};
  DAYS.forEach(day => dayCount[day] = 0);
  
  Object.keys(courseAllocations).forEach(courseId => {
    courseAllocations[courseId].forEach(allocation => {
      dayCount[allocation.day]++;
    });
  });
  
  // Sort days by allocation count (ascending)
  return DAYS.sort((a, b) => dayCount[a] - dayCount[b]);
};

// Main timetable generation function
exports.generateTimetable = async () => {
  try {
    console.log('Starting timetable generation...');
    
    // Fetch all data
    const teachers = await Teacher.find();
    const courses = await Course.find().populate('teachers');
    const classrooms = await Classroom.find();
    const sections = await Section.find();
    
    console.log(`Found: ${teachers.length} teachers, ${courses.length} courses, ${classrooms.length} classrooms, ${sections.length} sections`);
    
    if (teachers.length === 0 || courses.length === 0 || classrooms.length === 0 || sections.length === 0) {
      throw new Error('Missing required data for timetable generation');
    }
    
    // Global allocation tracking across all sections
    const globalTeacherAllocations = {};
    const globalClassroomAllocations = {};
    
    // Initialize global allocation tracking
    DAYS.forEach(day => {
      globalTeacherAllocations[day] = Array(PERIODS_PER_DAY).fill().map(() => new Map());
      globalClassroomAllocations[day] = Array(PERIODS_PER_DAY).fill().map(() => new Map());
    });
    
    const timetables = [];
    
    // For each section, create a timetable
    for (const section of sections) {
      console.log(`Generating timetable for section: ${section.name}`);
      
      // Initialize empty periods for each day
      const emptyPeriods = Array(PERIODS_PER_DAY).fill().map(() => ({
        course: null,
        teacher: null,
        classroom: null
      }));
      
      // Initialize timetable with empty periods
      const timetable = new Timetable({
        section: section._id,
        monday: { periods: JSON.parse(JSON.stringify(emptyPeriods)) },
        tuesday: { periods: JSON.parse(JSON.stringify(emptyPeriods)) },
        wednesday: { periods: JSON.parse(JSON.stringify(emptyPeriods)) },
        thursday: { periods: JSON.parse(JSON.stringify(emptyPeriods)) },
        friday: { periods: JSON.parse(JSON.stringify(emptyPeriods)) }
      });
      
      // Track teacher workload for this section
      const teacherWorkload = {};
      teachers.forEach(teacher => {
        teacherWorkload[teacher._id.toString()] = 0;
      });
      
      // Allocate courses to the timetable
      for (const course of courses) {
        console.log(`Processing course: ${course.code}`);
        
        // Skip if course has no assigned teachers
        if (!course.teachers || course.teachers.length === 0) {
          console.log(`Skipping course ${course.code} - no teachers assigned`);
          continue;
        }
        
        // Determine how many periods to allocate for this course
        const periodsToAllocate = course.isLab ? 
          Math.min(course.maxPeriods, 2) : // Labs get at most 2 consecutive periods
          Math.min(course.maxPeriods, course.minPeriods);
        
        console.log(`Allocating ${periodsToAllocate} periods for course ${course.code}`);
        
        let allocatedPeriods = 0;
        
        // Try to allocate the course
        while (allocatedPeriods < periodsToAllocate) {
          let allocated = false;
          
          // Try each day
          for (const day of DAYS) {
            if (allocated) break;
            
            // Try each period
            for (let period = 0; period < PERIODS_PER_DAY; period++) {
              if (allocated) break;
              
              // Skip if this period is already allocated for this section
              if (timetable[day].periods[period].course) {
                continue;
              }
              
              // For labs, ensure we have 2 consecutive periods available
              if (course.isLab && period >= PERIODS_PER_DAY - 1) {
                continue; // Not enough consecutive periods left in the day
              }
              
              if (course.isLab && timetable[day].periods[period + 1].course) {
                continue; // Next period is already allocated
              }
              
              // Try each teacher assigned to this course
              for (const teacher of course.teachers) {
                if (allocated) break;
                
                const teacherId = typeof teacher === 'object' ? teacher._id : teacher;
                
                // Find the teacher object
                const teacherObj = teachers.find(t => t._id.toString() === teacherId.toString());
                
                if (!teacherObj) {
                  console.log(`Teacher ${teacherId} not found`);
                  continue;
                }
                
                // Check if teacher is available at this time
                if (!teacherObj.availability || 
                    !teacherObj.availability[day] || 
                    !teacherObj.availability[day][period]) {
                  continue;
                }
                
                // For labs, check next period availability too
                if (course.isLab && 
                    (!teacherObj.availability[day][period + 1])) {
                  continue;
                }
                
                // Check if teacher is already allocated at this time GLOBALLY
                if (globalTeacherAllocations[day][period].has(teacherId.toString())) {
                  console.log(`Teacher ${teacherObj.name} already allocated at ${day} period ${period+1}`);
                  continue;
                }
                
                // For labs, check next period allocation too
                if (course.isLab && 
                    globalTeacherAllocations[day][period + 1].has(teacherId.toString())) {
                  console.log(`Teacher ${teacherObj.name} already allocated at ${day} period ${period+2}`);
                  continue;
                }
                
                // Check if teacher has reached max workload
                if (teacherWorkload[teacherId.toString()] >= teacherObj.maxWorkload) {
                  console.log(`Teacher ${teacherObj.name} has reached max workload`);
                  continue;
                }
                
                // Find an available classroom
                const availableClassroom = classrooms.find(classroom => 
                  classroom.capacity >= section.studentCount &&
                  !globalClassroomAllocations[day][period].has(classroom._id.toString())
                );
                
                if (!availableClassroom) {
                  console.log(`No available classroom for section ${section.name} on ${day} period ${period+1}`);
                  continue;
                }
                
                // For labs, check next period classroom availability too
                if (course.isLab && 
                    globalClassroomAllocations[day][period + 1].has(availableClassroom._id.toString())) {
                  console.log(`Classroom ${availableClassroom.roomNumber} already allocated at ${day} period ${period+2}`);
                  continue;
                }
                
                // Allocate the course
                timetable[day].periods[period] = {
                  course: course._id,
                  teacher: teacherId,
                  classroom: availableClassroom._id
                };
                
                // Update global teacher allocation
                globalTeacherAllocations[day][period].set(teacherId.toString(), section._id);
                
                // Update global classroom allocation
                globalClassroomAllocations[day][period].set(availableClassroom._id.toString(), section._id);
                
                // Update teacher workload
                teacherWorkload[teacherId.toString()] += 1;
                
                // For labs, allocate the next period as well
                if (course.isLab) {
                  timetable[day].periods[period + 1] = {
                    course: course._id,
                    teacher: teacherId,
                    classroom: availableClassroom._id
                  };
                  
                  // Update global teacher allocation for next period
                  globalTeacherAllocations[day][period + 1].set(teacherId.toString(), section._id);
                  
                  // Update global classroom allocation for next period
                  globalClassroomAllocations[day][period + 1].set(availableClassroom._id.toString(), section._id);
                  
                  // Update teacher workload for the next period
                  teacherWorkload[teacherId.toString()] += 1;
                  
                  // Count the lab as 2 periods
                  allocatedPeriods += 2;
                } else {
                  allocatedPeriods += 1;
                }
                
                allocated = true;
                console.log(`Allocated ${course.code} on ${day} period ${period+1} with teacher ${teacherObj.name} for section ${section.name}`);
                break;
              }
            }
          }
          
          // If we couldn't allocate a period, break the loop
          if (!allocated) {
            console.log(`Could not allocate more periods for course ${course.code} in section ${section.name}`);
            break;
          }
        }
      }
      
      // Save the timetable
      await timetable.save();
      console.log(`Timetable saved for section ${section.name}`);
      timetables.push(timetable);
    }
    
    return timetables;
  } catch (error) {
    console.error('Error generating timetable:', error);
    throw error;
  }
}; 
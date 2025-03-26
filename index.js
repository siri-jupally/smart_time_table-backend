const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('./utils/db');
const teacherRoutes = require('./routes/teachers');
const courseRoutes = require('./routes/courses');
const classroomRoutes = require('./routes/classrooms');
const sectionRoutes = require('./routes/sections');
const timetableRoutes = require('./routes/timetables');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API status route
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'API is operational',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/timetables', timetableRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
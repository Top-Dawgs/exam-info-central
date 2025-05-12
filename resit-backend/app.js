const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS: allow frontend on localhost:8080 + Authorization
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests explicitly
//app.options('*', cors());

// Parse incoming JSON requests
app.use(express.json());


// Static file serving for schedule uploads
app.use('/api/schedule', express.static(path.join(__dirname, 'uploads')));

// Routes
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

// Main API route for user-related requests (login, registration)
app.use('/api', userRoutes);

// Role-specific routes
app.use('/api/dashboard', dashboardRoutes);       // Dashboard
app.use('/api/student', studentRoutes);           // Student-specific endpoints (e.g., grades)
app.use('/api/instructor', instructorRoutes);     // Instructor-specific endpoints (e.g., file uploads)
app.use('/api/faculty', facultyRoutes);           // Faculty-specific endpoints (e.g., resit info updates)

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

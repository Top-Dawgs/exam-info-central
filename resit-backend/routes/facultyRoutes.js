const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const upload = require('../middlewares/upload');
const authenticateToken = require('../middlewares/authMiddleware');
const path = require('path');
const fs = require('fs');

// GET /api/resit-registrations/:course_id
router.get('/resit-registrations/:course_id', authenticateToken, async (req, res) => {
    const { userId, role } = req.user;
    const { course_id } = req.params;
  
    if (role !== 'instructor' && role !== 'faculty_secretary') {
      return res.status(403).json({ error: 'Only instructors or faculty secretaries can view registrations.' });
    }
  
    try {
      const [rows] = await pool.query(
        `SELECT u.email, g.grade, e.exam_date, c.course_code, c.course_name
         FROM ResitRegistrations r
         JOIN Users u ON r.student_id = u.user_id
         JOIN Exams e ON r.exam_id = e.exam_id
         JOIN Courses c ON e.course_id = c.course_id
         LEFT JOIN Grades g ON g.student_id = u.user_id AND g.course_id = c.course_id
         WHERE e.course_id = ? AND e.exam_type = 'resit'`,
        [course_id]
      );
  
      res.json({ participants: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not fetch resit registration list.' });
    }
 });



// POST /api/upload-schedule
router.post('/upload-schedule', authenticateToken, upload.single('file'), async (req, res) => {
  const { role } = req.user;

  if (role !== 'faculty_secretary') {
    return res.status(403).json({ error: 'Only faculty secretaries can upload schedules.' });
  }

  try {
    const filename = req.file.filename;

    // Optional: Store file name in database if you want to track it
    res.status(201).json({ message: 'Schedule uploaded successfully', filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload schedule.' });
  }
 });



// GET /api/schedule/:filename
router.get('/schedule/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);
  res.sendFile(filePath);
}); 


  // PATCH /api/update-resit-info
router.patch('/update-resit-info', authenticateToken, async (req, res) => {
  const { role } = req.user;
  const { course_id, exam_date, location } = req.body;

  if (role !== 'faculty_secretary') {
    return res.status(403).json({ error: 'Only faculty secretaries can update exam info.' });
  }

  if (!course_id) {
    return res.status(400).json({ error: 'course_id is required.' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT * FROM Exams WHERE course_id = ? AND exam_type = "resit"',
      [course_id]
    );

    if (!existing.length) {
      return res.status(404).json({ error: 'No resit exam found for this course.' });
    }

    await pool.query(
      `UPDATE Exams 
       SET exam_date = COALESCE(?, exam_date),
           location = COALESCE(?, location)
       WHERE course_id = ? AND exam_type = "resit"`,
      [exam_date, location, course_id]
    );

    res.json({ message: 'Resit exam information updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update resit exam info.' });
  }
 });


// POST /api/notify
router.post('/notify', authenticateToken, async (req, res) => {
    const { userId, role } = req.user;
    const { target_user_id, message } = req.body;
  
    if (!['instructor', 'faculty_secretary'].includes(role)) {
      return res.status(403).json({ error: 'Only instructors or secretaries can send notifications.' });
    }
  
    if (!target_user_id || !message) {
      return res.status(400).json({ error: 'target_user_id and message are required.' });
    }
  
    try {
        await pool.query(
            'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
            [student_id, `You’ve been auto-registered for a resit exam in course ID ${course_id}.`]
        );

      res.status(201).json({ message: 'Notification sent.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to send notification.' });
    }
 });

module.exports = router;
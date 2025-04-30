const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middlewares/authMiddleware');

// GET /api/my-grades (Only for logged-in students)
router.get('/my-grades', authenticateToken, async (req, res) => {
    const { userId, role } = req.user;
  
    if (role !== 'student') {
      return res.status(403).json({ error: 'Access denied. Only students can view their grades.' });
    }
  
    try {
      const [grades] = await pool.query(
        `SELECT c.course_code, c.course_name, g.grade, g.letter_grade
         FROM Grades g
         JOIN Courses c ON g.course_id = c.course_id
         WHERE g.student_id = ?`,
        [userId]
      );
  
      res.json({ grades });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not fetch grades' });
    }
  });
  
  // POST /api/declare-resit
router.post('/declare-resit', authenticateToken, async (req, res) => {
    const { userId, role } = req.user;
    const { course_id } = req.body;
  
    if (role !== 'student') {
      return res.status(403).json({ error: 'Only students can declare for resit exams.' });
    }
  
    try {
      // Step 1: Find the resit exam for this course
      const [examRows] = await pool.query(
        'SELECT exam_id FROM Exams WHERE course_id = ? AND exam_type = "resit"',
        [course_id]
      );
  
      if (examRows.length === 0) {
        return res.status(404).json({ error: 'No resit exam scheduled for this course yet.' });
      }
  
      const exam_id = examRows[0].exam_id;
  
      // Step 2: Try to insert the resit registration
      await pool.query(
        'INSERT INTO ResitRegistrations (student_id, exam_id) VALUES (?, ?)',
        [userId, exam_id]
      );
  
      res.json({ message: 'Successfully registered for the resit exam.' });
    } catch (err) {
      if (err.code === 'ER_SIGNAL_EXCEPTION') {
        return res.status(400).json({ error: err.sqlMessage });
      }
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Already registered for this resit exam.' });
      }
  
      console.error(err);
      res.status(500).json({ error: 'Failed to register for resit exam.' });
    }
  });


  // GET /api/my-resit-exams
router.get('/my-resit-exams', authenticateToken, async (req, res) => {
    const { userId, role } = req.user;
  
    if (role !== 'student') {
      return res.status(403).json({ error: 'Only students can view resit exam details.' });
    }
  
    try {
      const [rows] = await pool.query(
        `SELECT c.course_code, c.course_name,
                e.exam_date, e.location,
                e.no_of_questions, e.allowed_tools, e.notes
         FROM ResitRegistrations r
         JOIN Exams e ON r.exam_id = e.exam_id
         JOIN Courses c ON e.course_id = c.course_id
         WHERE r.student_id = ?`,
        [userId]
      );
  
      res.json({ resitExams: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not fetch resit exam details.' });
    }
  });
  


// GET /api/notifications
router.get('/notifications', authenticateToken, async (req, res) => {
    const { userId} = req.user;

    try {
        const [rows] = await pool.query(
            'SELECT message, created_at FROM Notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({ notifications: rows });
    }catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch notifications.'});
    }

 });

module.exports = router;
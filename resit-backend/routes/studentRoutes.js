const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middlewares/authMiddleware');

// GET /api/student/my-grades (Only for logged-in students)
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
  
  
// POST /api/student/declare-resit
router.post('/declare-resit', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  const { course_id } = req.body;

  if (role !== 'student') {
    return res.status(403).json({ error: 'Only students can declare resits.' });
  }

  try {
    // 1. Check if student is enrolled in this course
    const [enrolled] = await pool.query(
      'SELECT * FROM StudentCourses WHERE student_id = ? AND course_id = ?',
      [userId, course_id]
    );

    if (!enrolled.length) {
      return res.status(400).json({ error: 'You are not enrolled in this course.' });
    }

    // 2. Check eligibility based on grades
    const [grades] = await pool.query(
      'SELECT letter_grade FROM Grades WHERE student_id = ? AND course_id = ?',
      [userId, course_id]
    );
    const letter = grades[0]?.letter_grade;
    const eligible = ['FF', 'FD', 'DD', 'DC'];

    if (!eligible.includes(letter)) {
      return res.status(400).json({ error: 'You are not eligible for a resit in this course.' });
    }

    // 3. Check if there's a resit exam for this course
    const [exams] = await pool.query(
      'SELECT exam_id FROM Exams WHERE course_id = ? AND exam_type = "resit"',
      [course_id]
    );
    if (!exams.length) {
      return res.status(404).json({ error: 'No resit exam available for this course.' });
    }

    const exam_id = exams[0].exam_id;

    // 4. Prevent duplicate registration
    const [existing] = await pool.query(
      'SELECT * FROM ResitRegistrations WHERE student_id = ? AND exam_id = ?',
      [userId, exam_id]
    );
    if (existing.length) {
      return res.status(400).json({ error: 'You have already registered for this resit.' });
    }

    // 5. Register student for resit
    await pool.query(
      'INSERT INTO ResitRegistrations (student_id, exam_id) VALUES (?, ?)',
      [userId, exam_id]
    );

    // 🔔 6. Send notification
    const [course] = await pool.query(
      'SELECT course_name FROM Courses WHERE course_id = ?',
      [course_id]
    );
    const courseName = course[0]?.course_name || 'your course';

    await pool.query(
      'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
      [userId, `You successfully registered for the resit exam in ${courseName}.`]
    );

    return res.json({ message: 'Registered for resit successfully.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while declaring resit.' });
  }
});



// GET /api/student/my-resit-exams
router.get('/my-resit-exams', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;

  if (role !== 'student') {
    return res.status(403).json({ error: 'Only students can access this.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
         c.course_code,
         c.course_name,
         e.exam_date,
         e.location,
         e.no_of_questions,
         e.allowed_tools,
         e.notes,
         u.email AS instructor_email
       FROM ResitRegistrations r
       JOIN Exams e ON r.exam_id = e.exam_id
       JOIN Courses c ON e.course_id = c.course_id
       LEFT JOIN Users u ON c.instructor_id = u.user_id
       WHERE r.student_id = ? AND e.exam_type = 'resit'`,
      [userId]
    );
    

    res.json({ resitExams: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resit exams.' });
  }
});

  


// GET /api/student/notifications
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

 // GET /api/student/my-courses
router.get('/my-courses', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  if (role !== 'student') return res.status(403).end();
  const [courses] = await pool.query(
    `SELECT c.course_id, c.course_code, c.course_name
     FROM StudentCourses sc
     JOIN Courses c ON sc.course_id=c.course_id
     WHERE sc.student_id=?`,
    [userId]
  );
  res.json({ courses });
});

/* GET /api/student/my-courses
router.get('/my-courses', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  if (role !== 'student') return res.status(403).end();
  const [courses] = await pool.query(
    `SELECT c.course_id, c.course_code, c.course_name
     FROM StudentCourses sc
     JOIN Courses c ON sc.course_id=c.course_id
     WHERE sc.student_id=?`,
    [userId]
  );
  res.json({ courses });
});*/


// GET /api/student/eligible-resit-courses
router.get('/eligible-resit-courses', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;

  if (role !== 'student') {
    return res.status(403).json({ error: 'Only students can view eligible resit courses.' });
  }

  try {
    const [courses] = await pool.query(`
      SELECT DISTINCT c.course_id, c.course_code, c.course_name
      FROM StudentCourses sc
      JOIN Courses c ON sc.course_id = c.course_id
      JOIN Grades g ON g.course_id = c.course_id AND g.student_id = sc.student_id
      JOIN Exams e ON e.course_id = c.course_id AND e.exam_type = 'resit'
      LEFT JOIN ResitRegistrations r ON r.exam_id = e.exam_id AND r.student_id = sc.student_id
      WHERE sc.student_id = ?
        AND g.letter_grade IN ('FF', 'FD', 'DD', 'DC')
        AND r.exam_id IS NULL
    `, [userId]);

    res.json({ eligible_courses: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch eligible courses.' });
  }
});





module.exports = router;
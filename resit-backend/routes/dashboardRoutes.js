const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;

  try {
    if (role === 'student') {
      const [courseCountResult] = await pool.query(
        'SELECT COUNT(*) AS total_courses FROM StudentCourses WHERE student_id = ?',
        [userId]
      );

      const [resitcourseCountResult] = await pool.query(
        `SELECT COUNT(*) AS total_resits
         FROM ResitRegistrations r
         JOIN Exams e ON r.exam_id = e.exam_id
         WHERE r.student_id = ? AND e.exam_type = 'resit'`,
        [userId]
      );

      const [grades] = await pool.query(
        `SELECT letter_grade FROM Grades WHERE student_id = ?`,
        [userId]
      );

      const scale = {
        AA: 4.0, BA: 3.5, BB: 3.0, CB: 2.5, CC: 2.0,
        DC: 1.5, DD: 1.0, FD: 0.5, FF: 0.0, DZ: 0.0
      };

      let totalPoints = 0;
      let gpaCourseCount = 0;

      grades.forEach(g => {
        const point = scale[g.letter_grade];
        if (point !== undefined && g.letter_grade !== 'DZ') {
          totalPoints += point;
          gpaCourseCount++;
        }
      });

      const gpa = gpaCourseCount > 0 ? (totalPoints / gpaCourseCount).toFixed(2) : null;

      return res.json({
        role,
        total_courses: courseCountResult[0].total_courses,
        registered_resits: resitcourseCountResult[0].total_resits,
        gpa
      });

    } else if (role === 'instructor') {
      const [courses] = await pool.query(
        `SELECT c.course_id, c.course_code, COUNT(sc.student_id) AS total_students
         FROM Courses c
         JOIN StudentCourses sc ON c.course_id = sc.course_id
         GROUP BY c.course_id`
      );

      const [resitStats] = await pool.query(
        `SELECT c.course_code,
                COUNT(r.student_id) AS resit_students
         FROM ResitRegistrations r
         JOIN Exams e ON r.exam_id = e.exam_id
         JOIN Courses c ON e.course_id = c.course_id
         WHERE e.exam_type = 'resit'
         GROUP BY c.course_code`
      );

      return res.json({
        role,
        courses,
        resitStats
      });

    } else if (role === 'faculty_secretary') {
      const [resitCountResult] = await pool.query(
        `SELECT COUNT(*) AS total_resits FROM ResitRegistrations`
      );

      const [examCount] = await pool.query(
        `SELECT COUNT(*) AS total_resit_exams FROM Exams WHERE exam_type = 'resit'`
      );

      return res.json({
        role,
        total_resit_registrations: resitCountResult[0].total_resits,
        total_resit_exams: examCount[0].total_resit_exams
      });
    }

    res.status(403).json({ error: 'Unknown role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Dashboard failed to load' });
  }
});

module.exports = router;

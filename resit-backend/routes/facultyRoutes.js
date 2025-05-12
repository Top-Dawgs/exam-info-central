const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const upload = require('../middlewares/upload');
const authenticateToken = require('../middlewares/authMiddleware');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser'); 

// GET /api/faculty/resit-registrations/:course_id
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




// POST /api/faulty/upload-schedule
// Faculty secretary uploads a CSV with columns: course_code,exam_date,location
router.post(
  '/upload-schedule',
  authenticateToken,
  upload.single('file'),
  async (req, res) => {
    const { role } = req.user;
    if (role !== 'faculty_secretary') {
      return res.status(403).json({ error: 'Only faculty secretaries can upload schedules.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const results = { processed: 0, errors: [] };

    // Stream and parse CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        const { course_code, exam_date, location } = row;
        try {
          // 1. Find the course_id
          const [courses] = await pool.query(
            'SELECT course_id, instructor_id FROM Courses WHERE course_code = ?',
            [course_code]
          );
          if (!courses.length) {
            throw new Error(`No course with code ${course_code}`);
          }
          const { course_id, instructor_id } = courses[0];

          // 2. Update the Exams table for the resit exam
          const [exams] = await pool.query(
            'SELECT exam_id FROM Exams WHERE course_id = ? AND exam_type = "resit"',
            [course_id]
          );
          if (!exams.length) {
            throw new Error(`No resit exam scheduled for course ${course_code}`);
          }
          const exam_id = exams[0].exam_id;

          await pool.query(
            `UPDATE Exams
             SET exam_date = ?, location = ?
             WHERE exam_id = ?`,
            [exam_date, location, exam_id]
          );

          // 3. Notify every student registered for this resit
          const [registrants] = await pool.query(
            'SELECT student_id FROM ResitRegistrations WHERE exam_id = ?',
            [exam_id]
          );
          for (const { student_id } of registrants) {
            // Student notification
            await pool.query(
              'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
              [student_id, `Resit exam for ${course_code} scheduled on ${exam_date} at ${location}.`]
            );
          }

          // 4. Notify the instructor in charge
          await pool.query(
            'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
            [instructor_id, `Your course ${course_code} resit exam now scheduled on ${exam_date} at ${location}.`]
          );

          results.processed++;
        } catch (err) {
          results.errors.push(err.message);
        }
      })
      .on('end', () => {
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        res.json({ message: 'Schedule processed', ...results });
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: 'Failed to parse CSV.', details: err.message });
      });
  }
);



// GET /api/faculty/schedule/:filename
router.get('/schedule/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);
  res.sendFile(filePath);
}); 


  // PATCH /api/faculty/update-resit-info
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
  const { target_user_id, course_id, message } = req.body;

  console.log('Notify API called by:', userId, 'as role:', role);
  console.log('Request body:', { target_user_id, course_id, message });

  if (!['instructor', 'faculty_secretary'].includes(role)) {
    return res.status(403).json({ error: 'Only instructors or secretaries can send notifications.' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const notifications = [];

    if (target_user_id) {
      await pool.query(
        'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
        [target_user_id, message]
      );
      notifications.push(target_user_id);
    }

    if (course_id) {
      const [students] = await pool.query(
        `SELECT DISTINCT rr.student_id
         FROM ResitRegistrations rr
         JOIN Exams e ON rr.exam_id = e.exam_id
         WHERE e.course_id = ? AND e.exam_type = 'resit'`,
        [course_id]
      );

      for (const { student_id } of students) {
        await pool.query(
          'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
          [student_id, message]
        );
        notifications.push(student_id);
      }

      const [instructors] = await pool.query(
        'SELECT instructor_id FROM Courses WHERE course_id = ?',
        [course_id]
      );

      if (instructors.length && instructors[0].instructor_id) {
        const instructorId = instructors[0].instructor_id;
        await pool.query(
          'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
          [instructorId, message]
        );
        notifications.push(instructorId);
      }
    }

    if (notifications.length === 0) {
      return res.status(400).json({ error: 'No valid recipient provided.' });
    }

    res.status(201).json({ message: 'Notification(s) sent.', recipients: notifications });

  } catch (err) {
    console.error('Notify route failed:', err);
    res.status(500).json({ error: 'Failed to send notification.', details: err.message });
  }
});

// GET /api/faculty/all-resit-registrations
router.get('/all-resit-registrations', authenticateToken, async (req, res) => {
  const { role } = req.user;

  if (role !== 'faculty_secretary') {
    return res.status(403).json({ error: 'Only faculty secretaries can view this data.' });
  }

  try {
    const [courses] = await pool.query(
      `SELECT 
         c.course_id,
         c.course_code,
         c.course_name,
         COUNT(DISTINCT r.student_id) AS total_registered
       FROM ResitRegistrations r
       JOIN Exams e ON r.exam_id = e.exam_id
       JOIN Courses c ON e.course_id = c.course_id
       WHERE e.exam_type = 'resit'
       GROUP BY c.course_id`
    );

    // For each course, get student details
    const results = [];

    for (const course of courses) {
      const [students] = await pool.query(
        `SELECT u.user_id AS student_id, u.email AS student_name
         FROM ResitRegistrations r
         JOIN Exams e ON r.exam_id = e.exam_id
         JOIN Users u ON r.student_id = u.user_id
         WHERE e.course_id = ? AND e.exam_type = 'resit'`,
        [course.course_id]
      );

      results.push({
        course_id: course.course_id,
        course_code: course.course_code,
        course_name: course.course_name,
        student_count: course.total_registered,
        students
      });
    }

    res.json({ registrations: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resit registrations.' });
  }
});



// GET /api/faculty/all-resit-exams
router.get('/all-resit-exams', authenticateToken, async (req, res) => {
  const { role } = req.user;

  if (role !== 'faculty_secretary') {
    return res.status(403).json({ error: 'Only faculty secretaries can access this data.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
         c.course_id,
         c.course_code,
         c.course_name,
         e.exam_date,
         e.location,
         u.email AS instructor_name
       FROM Exams e
       JOIN Courses c ON e.course_id = c.course_id
       LEFT JOIN Users u ON c.instructor_id = u.user_id
       WHERE e.exam_type = 'resit'`
    );

    res.json({ exams: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resit exam data.' });
  }
});


// GET /api/faculty/resit-registered-students
router.get('/resit-registered-students', authenticateToken, async (req, res) => {
  const { role } = req.user;

  if (role !== 'faculty_secretary') {
    return res.status(403).json({ error: 'Only faculty secretaries can view this data.' });
  }

  try {
    const [students] = await pool.query(
      `SELECT DISTINCT u.user_id, u.email
       FROM ResitRegistrations rr
       JOIN Users u ON rr.student_id = u.user_id`
    );

    res.json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resit-registered students.' });
  }
});

// GET /api/faculty/resit-courses
router.get('/resit-courses', authenticateToken, async (req, res) => {
  const { role } = req.user;

  if (role !== 'faculty_secretary') {
    return res.status(403).json({ error: 'Only faculty secretaries can view this data.' });
  }

  try {
    const [courses] = await pool.query(
      `SELECT DISTINCT c.course_id, c.course_code, c.course_name
       FROM Exams e
       JOIN Courses c ON e.course_id = c.course_id
       WHERE e.exam_type = 'resit'`
    );

    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses with resit exams.' });
  }
});

// GET /api/faculty/export-resit/:course_id
const { Parser } = require('json2csv');

router.get('/export-resit/:course_id', authenticateToken, async (req, res) => {
  const { role } = req.user;
  const { course_id } = req.params;

  if (role !== 'faculty_secretary') {
    return res.status(403).json({ error: 'Only faculty secretaries can export resit data.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
         u.email AS student_email,
         c.course_code,
         c.course_name,
         g.grade AS numeric_grade,
         g.letter_grade
       FROM ResitRegistrations r
       JOIN Exams e ON r.exam_id = e.exam_id
       JOIN Courses c ON e.course_id = c.course_id
       JOIN Users u ON r.student_id = u.user_id
       LEFT JOIN Grades g ON g.student_id = u.user_id AND g.course_id = c.course_id
       WHERE e.course_id = ? AND e.exam_type = 'resit'`,
      [course_id]
    );

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment(`resit_registrations_course_${course_id}.csv`);
    return res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export CSV.', details: err.message });
  }
});


module.exports = router;
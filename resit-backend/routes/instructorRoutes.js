const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const upload = require('../middlewares/upload');
const authenticateToken = require('../middlewares/authMiddleware');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Post /api/instructor/submit-grade
router.post('/submit-grade', authenticateToken, async (req, res) => {
    const {userId, role} = req.user;

    if(role !== 'instructor') {
        return res.status(403),json({ error: 'Only instructors can upload grades.'});
    }

    const { student_id, course_id, grade } = req.body;

    if(!student_id || !course_id || grade === undefined) {

        return res.status(400).json({ error: 'Missing student_id, course_id, or grade' });
    }

    try {
        // Check if grafe already exists (to uodate instead of inserting again)
        const [existing] = await pool.query(
            'SELECT * FROM Grades WHERE student_id = ? AND course_id = ?',
        [student_id, course_id]
        );

        if (existing.length > 0 ) {
            //Updates existing grades
            await pool.query(
                'UPDATE Grades SET grade = ? WHERE student_id = ? and course_id = ?',
                [grade, student_id, course_id]
            );
            return res.json({ message: 'Grade updated Successfully' });
        } else {
            // Inserts new grade if it doesnt exists.
            await pool.query(
                'INSERT INTO Grades (student_id, course_id, grade) VALUES (?, ?, ?)',
                [student_id, course_id, grade]
            );

            return res.status(200).json({ message: 'Grade submitted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit grade' });
    }
});

 // POST /api/instructor/resit-details
 router.post('/resit-details', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;

  if (role !== 'instructor') {
    return res.status(403).json({ error: 'Only instructors can set resit exams' });
  }

  const { course_id, no_of_questions, allowed_tools, notes } = req.body;

  if (!course_id) {
    return res.status(400).json({ error: 'Course ID is required.' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT * FROM Exams WHERE course_id = ? AND exam_type = "resit"',
      [course_id]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE Exams 
         SET no_of_questions = ?, allowed_tools = ?, notes = ?
         WHERE course_id = ? AND exam_type = 'resit'`,
        [no_of_questions, allowed_tools, notes, course_id]
      );
      return res.json({ message: 'Resit exam details updated.' });
    } else {
      await pool.query(
        `INSERT INTO Exams (course_id, exam_type, no_of_questions, allowed_tools, notes)
         VALUES (?, 'resit', ?, ?, ?)`,
        [course_id, no_of_questions, allowed_tools, notes]
      );
      return res.status(201).json({ message: 'Resit exam created successfully.' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set resit exam details.' });
  }
});


// GET /api/instructor/resit-registrations/:course_id
router.get('/resit-registrations/:course_id', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  const { course_id } = req.params;

  if (role !== 'instructor' && role !== 'faculty_secretary') {
    return res.status(403).json({ error: 'Only instructors or secretaries can view registrations.' });
  }

  try {
    // Ensure course belongs to this instructor (secretary bypasses)
    if (role === 'instructor') {
      const [course] = await pool.query(
        'SELECT 1 FROM Courses WHERE course_id = ? AND instructor_id = ?',
        [course_id, userId]
      );
      if (!course.length) {
        return res.status(403).json({ error: 'Not your course.' });
      }
    }

    const [rows] = await pool.query(
      `SELECT u.email, g.grade, g.letter_grade, e.exam_date, c.course_code, c.course_name
       FROM ResitRegistrations r
       JOIN Users u ON r.student_id = u.user_id
       JOIN Exams e ON r.exam_id = e.exam_id
       JOIN Courses c ON e.course_id = c.course_id
       LEFT JOIN Grades g ON g.student_id = u.user_id AND g.course_id = c.course_id
       WHERE c.course_id = ? AND e.exam_type = 'resit'`,
      [course_id]
    );

    res.json({ participants: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch resit registration list.' });
  }
});


// POST /api/instructor/upload-grades-file
router.post(
    '/upload-grades-file',
    authenticateToken,
    upload.single('file'),
    async (req, res) => {
      const { role } = req.user;
      const course_id = req.body.course_id;
      if (role !== 'instructor') {
        return res.status(403).json({ error: 'Only instructors can upload grades.' });
      }
      if (!course_id) {
        return res.status(400).json({ error: 'Missing course_id in request.' });
      }
  
      // 1) Read all CSV rows into memory
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      const rows = [];
      try {
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', row => rows.push(row))
            .on('end', resolve)
            .on('error', reject);
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to parse CSV.', details: err.message });
      }
  
      // 2) Helper to map numeric→letter exactly
      function getLetterGrade(value) {
        if (String(value).toUpperCase() === 'DZ') return 'DZ';
        const score = parseFloat(value);
        if (isNaN(score) || score < 0 || score > 100) return null;
        if (score >= 90 && score <= 100) return 'AA';
        if (score >= 85 && score <= 89)  return 'BA';
        if (score >= 80 && score <= 84)  return 'BB';
        if (score >= 75 && score <= 79)  return 'CB';
        if (score >= 70 && score <= 74)  return 'CC';
        if (score >= 65 && score <= 69)  return 'DC';
        if (score >= 60 && score <= 64)  return 'DD';
        if (score >= 50 && score <= 59)  return 'FD';
        if (score >= 0  && score <= 49)  return 'FF';
        return null;
      }
  
      const results = { processed: 0, errors: [] };
  
      // 3) Process each row sequentially
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // a) Determine student_id
          let student_id = row.student_id;
          if (!student_id && row.email) {
            const [users] = await pool.query(
              'SELECT user_id FROM Users WHERE email = ?', [row.email]
            );
            if (!users.length) throw new Error(`No user with email ${row.email}`);
            student_id = users[0].user_id;
          }
          if (!student_id) {
            throw new Error(`Row ${i+1}: missing student_id or email`);
          }
  
          // b) Compute letter
          const letter = getLetterGrade(row.grade);
          if (!letter) {
            throw new Error(`Row ${i+1}: invalid grade "${row.grade}"`);
          }
  
          // c) Upsert into Grades
          const numericGrade = letter === 'DZ' ? null : parseFloat(row.grade);
          const [existing] = await pool.query(
            'SELECT 1 FROM Grades WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
          );
          if (existing.length) {
            await pool.query(
              'UPDATE Grades SET grade = ?, letter_grade = ? WHERE student_id = ? AND course_id = ?',
              [numericGrade, letter, student_id, course_id]
            );
          } else {
            await pool.query(
              'INSERT INTO Grades (student_id, course_id, grade, letter_grade) VALUES (?, ?, ?, ?)',
              [student_id, course_id, numericGrade, letter]
            );
          }
  
          /* d) Auto-register FF/FD
          if (['FF','FD'].includes(letter)) {
            const [exams] = await pool.query(
              'SELECT exam_id FROM Exams WHERE course_id = ? AND exam_type = "resit"',
              [course_id]
            );
            if (exams.length) {
              await pool.query(
                'INSERT IGNORE INTO ResitRegistrations (student_id, exam_id) VALUES (?, ?)',
                [student_id, exams[0].exam_id]
              );
            }
          }*/
  
          // e) Remove old registrations if no longer eligible
          if (!['FF','FD','DD','DC'].includes(letter)) {
            const [exams] = await pool.query(
              'SELECT exam_id FROM Exams WHERE course_id = ? AND exam_type = "resit"',
              [course_id]
            );
            if (exams.length) {
              await pool.query(
                'DELETE FROM ResitRegistrations WHERE student_id = ? AND exam_id = ?',
                [student_id, exams[0].exam_id]
              );
            }
          }
  
          results.processed++;
        } catch (err) {
          results.errors.push(err.message);
        }
      }
  
      // 4) Clean up and respond
      fs.unlinkSync(filePath);
      res.json({ message: 'Upload complete', ...results });
    }
 );

 
// GET /api/instructor/export-resit/:course_id
router.get('/export-resit/:course_id', authenticateToken, async (req, res) => {
    const { userId, role } = req.user;
    const { course_id } = req.params;
  
    if (!['instructor', 'faculty_secretary'].includes(role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    try {
      const [rows] = await pool.query(
        `SELECT u.user_id, u.email, g.grade, g.letter_grade, c.course_code, c.course_name, e.exam_date
         FROM ResitRegistrations r
         JOIN Users u ON r.student_id = u.user_id
         JOIN Exams e ON r.exam_id = e.exam_id
         JOIN Courses c ON e.course_id = c.course_id
         LEFT JOIN Grades g ON g.student_id = u.user_id AND g.course_id = c.course_id
         WHERE e.exam_type = 'resit' AND c.course_id = ?`,
        [course_id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No registered students found for this course.' });
      }
  
      const fields = [
        'user_id',
        'email',
        'grade',
        'letter_grade',
        'course_code',
        'course_name',
        'exam_date'
      ];
  
      const parser = new Parser({ fields });
      const csv = parser.parse(rows);
  
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=resit_participants_course_${course_id}.csv`);
      res.status(200).send(csv);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to export CSV.' });
    }
});

// POST /api/notify
router.post('/notify', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  const { target_user_id, course_id, message } = req.body;

  if (!['instructor', 'faculty_secretary'].includes(role)) {
    return res.status(403).json({ error: 'Only instructors or secretaries can send notifications.' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const notifications = [];

    // Option A: Notify specific user
    if (target_user_id) {
      await pool.query(
        'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
        [target_user_id, message]
      );
      notifications.push(target_user_id);
    }

    // Option B: Notify entire course (students + instructor)
    if (course_id) {
      // 1. Notify students registered for the course (resit)
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

      // 2. Notify instructor for that course
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

    res.status(201).json({ message: 'Notification(s) sent.', recipients: notifications });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send notification.', details: err.message });
  }
});


// GET /api/instructor/my-courses
router.get('/my-courses', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  if (role !== 'instructor') return res.status(403).end();

  const [courses] = await pool.query(
    'SELECT course_id, course_code, course_name FROM Courses WHERE instructor_id = ?',
    [userId]
  );
  res.json({ courses });
});


module.exports = router;
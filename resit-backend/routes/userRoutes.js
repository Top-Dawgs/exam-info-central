const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');
const authenticateToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');



// POST /api/register
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  
  try {
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert into DB
    const [result] = await pool.query(
      'INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User registered', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});



// Post /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = rows[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid Password' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      'mySuperSecretKey123',
      { expiresIn: '1h' }
    );

    // ✅ Send full user object back
    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});




// GET /verify
router.get('/verify', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;

  try {
    // Fetch user data from DB (simplified)
    const [rows] = await pool.query(
      'SELECT user_id, email, role FROM Users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});


module.exports = router;


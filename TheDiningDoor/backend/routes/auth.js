const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

const JWT_SECRET  = process.env.JWT_SECRET || 'dining_door_dev_secret';
const JWT_EXPIRES = '7d';

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, role,
          restaurantName, restaurantAddr, bizLicense, vehicleType } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }
  if (!['customer','owner','delivery','admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    // Check duplicate email
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?,?,?,?,?,?)',
      [firstName, lastName, email, phone, hash, role]
    );
    const userId = result.insertId;

    // Role-specific setup
    if (role === 'owner' && restaurantName) {
      await db.query(
        'INSERT INTO restaurants (owner_id, name, address, business_license) VALUES (?,?,?,?)',
        [userId, restaurantName, restaurantAddr, bizLicense]
      );
    }
    if (role === 'delivery' && vehicleType) {
      await db.query(
        'INSERT INTO delivery_profiles (user_id, vehicle_type) VALUES (?,?)',
        [userId, vehicleType]
      );
    }

    res.status(201).json({ message: 'Account created successfully.' });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, first_name, last_name, email, role, password_hash, is_active FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated. Contact support.' });
    }
    if (role && user.role !== role) {
      return res.status(401).json({ message: `This account is not registered as ${role}.` });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      user: {
        id:    user.id,
        name:  `${user.first_name} ${user.last_name}`,
        email: user.email,
        role:  user.role,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, first_name, last_name, email, phone, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', (req, res) => {
  // JWT is stateless; client should delete the token.
  // Optionally: maintain a token blacklist in Redis.
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;

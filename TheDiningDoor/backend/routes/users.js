const express = require('express');
const r = express.Router();
const auth = require('../middleware/auth');
const db   = require('../config/db');

r.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  const [rows] = await db.query('SELECT id, first_name, last_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
  res.json(rows);
});

r.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  const { is_active } = req.body;
  await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
  res.json({ message: 'User status updated.' });
});

module.exports = r;

// messages.js
const express = require('express');
const r = express.Router();
const auth = require('../middleware/auth');
const db   = require('../config/db');

r.get('/', auth, async (req, res) => {
  const [rows] = await db.query(
    `SELECT m.*, u.first_name, u.last_name FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.receiver_id = ? OR m.sender_id = ?
     ORDER BY m.created_at DESC`, [req.user.id, req.user.id]
  );
  res.json(rows);
});

r.post('/', auth, async (req, res) => {
  const { receiverId, text, orderId } = req.body;
  await db.query('INSERT INTO messages (sender_id, receiver_id, content, order_id) VALUES (?,?,?,?)',
    [req.user.id, receiverId, text, orderId || null]);
  res.status(201).json({ message: 'Sent.' });
});

module.exports = r;

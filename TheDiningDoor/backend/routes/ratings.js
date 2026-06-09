// ratings.js
const express = require('express');
const r = express.Router();
const auth = require('../middleware/auth');
const db   = require('../config/db');

// Submit rating — only after completed order (BR-3)
r.post('/', auth, async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ message: 'Customer only.' });
  const { orderId, restaurantId, score, comment } = req.body;
  if (score < 1 || score > 5) return res.status(400).json({ message: 'Score must be 1-5.' });
  // Verify order is delivered and belongs to this customer
  const [orders] = await db.query(
    "SELECT id FROM orders WHERE id = ? AND customer_id = ? AND status = 'delivered'",
    [orderId, req.user.id]
  );
  if (!orders.length) return res.status(403).json({ message: 'Can only rate after a completed delivery.' });
  await db.query('INSERT INTO ratings (order_id, customer_id, restaurant_id, score, comment) VALUES (?,?,?,?,?)',
    [orderId, req.user.id, restaurantId, score, comment]);
  // Update restaurant avg rating
  await db.query(
    'UPDATE restaurants SET average_rating = (SELECT AVG(score) FROM ratings WHERE restaurant_id = ?) WHERE id = ?',
    [restaurantId, restaurantId]
  );
  res.status(201).json({ message: 'Rating submitted.' });
});

module.exports = r;

const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

// GET /api/orders — customer gets their orders
router.get('/', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, r.name AS restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/restaurant — owner gets their restaurant's orders
router.get('/restaurant', auth, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Owner only.' });
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.first_name, u.last_name
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE r.owner_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// POST /api/orders — place a new order
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ message: 'Customer only.' });
  const { restaurantId, items, totalPrice, deliveryAddress } = req.body;
  if (!restaurantId || !items || !totalPrice) {
    return res.status(400).json({ message: 'Missing required order fields.' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO orders (customer_id, restaurant_id, total_price, delivery_address, status)
       VALUES (?,?,?,?,'pending')`,
      [req.user.id, restaurantId, totalPrice, deliveryAddress]
    );
    const orderId = result.insertId;
    // Insert order items
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?,?,?,?)',
        [orderId, item.menuItemId, item.quantity, item.price]
      );
    }
    res.status(201).json({ message: 'Order placed.', orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to place order.' });
  }
});

// PATCH /api/orders/:id/status — update order status
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['confirmed','preparing','ready','out_for_delivery','delivered','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status.' });
  }
});

// GET /api/orders/:id — single order detail
router.get('/:id', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, r.name AS restaurant_name, r.address AS restaurant_address
       FROM orders o JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ?`, [req.params.id]
    );
    if (!orders.length) return res.status(404).json({ message: 'Order not found.' });
    const [items] = await db.query(
      `SELECT oi.*, mi.name, mi.price FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = ?`, [req.params.id]
    );
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order.' });
  }
});

module.exports = router;

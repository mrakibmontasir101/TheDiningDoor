const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

// GET /api/restaurants — list all (with optional search/category)
router.get('/', async (req, res) => {
  const { search, cuisine } = req.query;
  let q = 'SELECT r.*, u.first_name, u.last_name FROM restaurants r JOIN users u ON r.owner_id = u.id WHERE r.is_active = 1';
  const params = [];
  if (search)  { q += ' AND r.name LIKE ?';    params.push(`%${search}%`); }
  if (cuisine) { q += ' AND r.cuisine_type = ?'; params.push(cuisine); }
  q += ' ORDER BY r.average_rating DESC';
  try {
    const [rows] = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch restaurants.' });
  }
});

// GET /api/restaurants/:id — single restaurant + menu
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Restaurant not found.' });
    const [menu] = await db.query('SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1', [req.params.id]);
    const [videos] = await db.query('SELECT * FROM video_ads WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 3', [req.params.id]);
    res.json({ ...rows[0], menu, videos });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PATCH /api/restaurants/:id/kitchen-status — owner updates kitchen status
router.patch('/:id/kitchen-status', auth, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Owner only.' });
  const { status } = req.body;
  const valid = ['idle','preparing','ready','closed'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  try {
    await db.query('UPDATE restaurants SET kitchen_status = ? WHERE id = ? AND owner_id = ?',
      [status, req.params.id, req.user.id]);
    res.json({ message: 'Kitchen status updated.', status });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/restaurants/:id/menu — add menu item
router.post('/:id/menu', auth, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Owner only.' });
  const { name, description, price, category } = req.body;
  try {
    await db.query(
      'INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES (?,?,?,?,?)',
      [req.params.id, name, description, price, category]
    );
    res.status(201).json({ message: 'Menu item added.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add menu item.' });
  }
});

module.exports = router;

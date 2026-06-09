const express  = require('express');
const r        = express.Router();
const auth     = require('../middleware/auth');
const multer   = require('multer');
const db       = require('../config/db');
const path     = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/videos'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.mp4','.mov','.avi','.webm'].includes(ext)) cb(null, true);
    else cb(new Error('Invalid video format.'));
  },
});

// POST /api/videos — upload video ad (owner only)
r.post('/', auth, upload.single('video'), async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Owner only.' });
  const { title, restaurantId } = req.body;
  try {
    await db.query(
      'INSERT INTO video_ads (restaurant_id, title, file_url) VALUES (?,?,?)',
      [restaurantId, title, req.file.path]
    );
    res.status(201).json({ message: 'Video uploaded.' });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed.' });
  }
});

// GET /api/videos/:restaurantId
r.get('/:restaurantId', async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM video_ads WHERE restaurant_id = ? ORDER BY created_at DESC',
    [req.params.restaurantId]
  );
  res.json(rows);
});

module.exports = r;

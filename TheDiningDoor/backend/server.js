const express    = require('express');
const http       = require('http');
const WebSocket  = require('ws');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

// ── SECURITY MIDDLEWARE ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api/', limiter);

// ── STATIC FILES ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── ROUTES ───────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/restaurants',   require('./routes/restaurants'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/ratings',       require('./routes/ratings'));
app.use('/api/videos',        require('./routes/videos'));

// ── WEBSOCKET SERVER ─────────────────────────────────────────
const wss = new WebSocket.Server({ server });

// Map: userId → WebSocket connection
const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      switch (msg.type) {

        // Register this connection to a userId
        case 'AUTH':
          ws.userId = msg.userId;
          clients.set(msg.userId, ws);
          console.log(`User ${msg.userId} connected via WS`);
          break;

        // Chat message: { type, senderId, receiverId, text, orderId }
        case 'MESSAGE':
          const target = clients.get(msg.receiverId);
          if (target && target.readyState === WebSocket.OPEN) {
            target.send(JSON.stringify({
              type:       'MESSAGE',
              senderId:   msg.senderId,
              text:       msg.text,
              orderId:    msg.orderId,
              timestamp:  new Date().toISOString(),
            }));
          }
          // Persist to DB
          // await saveMessage(msg);
          break;

        // Kitchen status update: { type, orderId, status, restaurantId }
        case 'KITCHEN_UPDATE':
          // Broadcast to order's customer
          broadcastOrderUpdate(msg.orderId, {
            type:      'KITCHEN_UPDATE',
            orderId:   msg.orderId,
            status:    msg.status,
            timestamp: new Date().toISOString(),
          });
          break;

        // Delivery location update: { type, deliveryId, lat, lng }
        case 'LOCATION_UPDATE':
          broadcastOrderUpdate(msg.orderId, {
            type: 'LOCATION_UPDATE',
            lat:  msg.lat,
            lng:  msg.lng,
          });
          break;

        default:
          console.warn('Unknown WS message type:', msg.type);
      }
    } catch (e) {
      console.error('WS message parse error:', e.message);
    }
  });

  ws.on('close', () => {
    if (ws.userId) clients.delete(ws.userId);
    console.log('WebSocket client disconnected');
  });
});

function broadcastOrderUpdate(orderId, payload) {
  // In production: look up customer/delivery userId from orderId in DB
  // For now, broadcast to all (demo)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}

// ── CATCH-ALL: Serve frontend ────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── ERROR HANDLER ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ── START ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🍽  The Dining Door server running on port ${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api\n`);
});

module.exports = { app, server };

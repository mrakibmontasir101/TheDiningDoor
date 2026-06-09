# 🍽 The Dining Door

> Web-based food ordering and social media platform — Dongshin University, Master Software Design I

---

## What is it?

The Dining Door connects **customers**, **restaurant owners**, and **delivery personnel** on a single web platform with real-time social features.

| Feature | Description |
|---------|-------------|
| 🗺 Map Browse | Discover restaurants on an interactive map (Kakao/Google) |
| 💬 Real-Time Chat | WebSocket messaging between customers and owners |
| 🔄 Live Kitchen Status | Owners update stages; customers see it instantly |
| 📹 Video Ads | Restaurants upload 60-second promotional videos |
| 🚴 Delivery Module | Delivery personnel accept, navigate, and confirm orders |
| ⭐ Verified Reviews | Ratings only unlock after a completed order |

---

## Project Structure

```
TheDiningDoor/
├── frontend/
│   ├── index.html              ← Landing page
│   ├── css/style.css           ← Global styles
│   └── pages/
│       ├── login.html
│       ├── register.html
│       ├── home.html           ← Map + restaurant browser
│       ├── owner-dashboard.html
│       ├── delivery-dashboard.html
│       └── messages.html
├── backend/
│   ├── server.js               ← Express + WebSocket entry point
│   ├── config/db.js            ← MySQL connection pool
│   ├── middleware/auth.js      ← JWT middleware
│   └── routes/
│       ├── auth.js
│       ├── restaurants.js
│       ├── orders.js
│       ├── messages.js
│       ├── ratings.js
│       ├── videos.js
│       └── users.js
└── database/
    └── schema.sql              ← Full MySQL schema
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MySQL 8.0+
- Git

### 2. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/TheDiningDoor.git
cd TheDiningDoor
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up the database

```bash
mysql -u root -p < database/schema.sql
```

### 5. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and API keys
```

### 6. Run the server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Open http://localhost:5000 in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/restaurants` | List restaurants |
| GET | `/api/restaurants/:id` | Restaurant + menu |
| POST | `/api/orders` | Place order |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/messages` | Get conversations |
| POST | `/api/ratings` | Submit rating |
| POST | `/api/videos` | Upload video ad |

---

## Team

| Name | Role |
|------|------|
| Sadik Md. Nafis | Team Lead |
| Rakib Montasir Mahmud | Backend |
| Akhter Syed Latiful | Frontend |
| Uddin Md. Bakhtear | Database |
| Rokia | UI/UX |

**Dongshin University · Master Software Design I · 2024**

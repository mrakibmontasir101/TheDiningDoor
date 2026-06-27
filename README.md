# 🍽 The Dining Door

> **Web-Based Food Ordering & Social Media Platform**  
> Dongshin University · Master Software Design I · 2024

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Railway-orange)](https://thediningdoor-production.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-mrakibmontasir101-black)](https://github.com/mrakibmontasir101/TheDiningDoor)

---

## 📌 About

The Dining Door is a web-based food ordering and social media platform built for the Korean market. Unlike existing platforms like Baemin and Coupang, The Dining Door combines food ordering with real-time social features — giving restaurants tools to build trust and giving customers a better experience.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🗺 Map-Based Discovery | Browse nearby restaurants on an interactive map (Kakao / Google Maps) |
| 💬 Real-Time Messaging | WebSocket-powered direct chat between customers and restaurant owners |
| 🔄 Live Kitchen Status | Owners update preparation stages — customers see it instantly |
| 📹 Video Ads | Restaurants upload short 60-second promotional videos |
| 🚴 Delivery Module | Order assignment, map navigation, and earnings tracking |
| ⭐ Verified Reviews | Ratings only unlock after confirmed delivery — no fake reviews |

---

## 👥 User Roles

- **Customer** — Browse map, place orders, track delivery, message owners, rate restaurants
- **Restaurant Owner** — Manage orders, update kitchen status, upload videos, reply to customers
- **Delivery Personnel** — Accept orders, navigate to customer, confirm delivery
- **System Admin** — Manage users, restaurants, orders, and content

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |
| Real-Time | WebSocket (ws library) |
| Authentication | JWT + bcrypt |
| Maps | Kakao Maps / Google Maps API |
| Storage | AWS S3 (video & media) |
| Deployment | Railway |

---

## 📁 Project Structure

```
TheDiningDoor/
├── frontend/
│   ├── index.html                  ← Landing page
│   ├── css/
│   │   └── style.css               ← Global design system
│   └── pages/
│       ├── login.html
│       ├── register.html
│       ├── home.html               ← Map + restaurant browser
│       ├── owner-dashboard.html    ← Restaurant owner panel
│       ├── delivery-dashboard.html ← Delivery personnel panel
│       ├── admin-dashboard.html    ← Admin control panel
│       └── messages.html           ← Real-time chat
├── backend/
│   ├── server.js                   ← Express + WebSocket server
│   ├── config/
│   │   └── db.js                   ← MySQL connection pool
│   ├── middleware/
│   │   └── auth.js                 ← JWT authentication middleware
│   └── routes/
│       ├── auth.js                 ← Register & login
│       ├── restaurants.js          ← Restaurant management
│       ├── orders.js               ← Order placement & tracking
│       ├── messages.js             ← Messaging
│       ├── ratings.js              ← Review system
│       ├── videos.js               ← Video ad upload
│       └── users.js                ← Admin user management
├── database/
│   └── schema.sql                  ← Full MySQL schema (9 tables)
├── .env.example                    ← Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm 9+

### 1. Clone the repository
```bash
git clone https://github.com/mrakibmontasir101/TheDiningDoor.git
cd TheDiningDoor/TheDiningDoor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
```bash
mysql -u root -p < database/schema.sql
```

### 4. Configure environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in your values:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dining_door
DB_PORT=3306
JWT_SECRET=your_secret_key
PORT=5000
```

### 5. Start the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

### 6. Open in browser
```
http://localhost:5000
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | List all restaurants |
| GET | `/api/restaurants/:id` | Get restaurant + menu |
| PATCH | `/api/restaurants/:id/kitchen-status` | Update kitchen status |
| POST | `/api/restaurants/:id/menu` | Add menu item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place new order |
| GET | `/api/orders` | Get customer orders |
| GET | `/api/orders/:id` | Get order details |
| PATCH | `/api/orders/:id/status` | Update order status |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send message |
| POST | `/api/ratings` | Submit rating (after delivery only) |
| POST | `/api/videos` | Upload video ad |
| GET | `/api/users` | List all users (admin only) |

---

## 🗄 Database Schema

9 tables: `users`, `restaurants`, `menu_items`, `orders`, `order_items`, `messages`, `ratings`, `video_ads`, `delivery_profiles`

Key constraint: `ratings.order_id` is UNIQUE — one rating per order, only after confirmed delivery.

---

## 🔒 Security

- HTTPS with TLS 1.2+
- bcrypt password hashing
- JWT stateless authentication
- Role-Based Access Control (RBAC)
- OWASP Top 10 protection
- Rate limiting on all API routes
- PIPA (Korea) compliance

---

## 🌐 Live Demo

The platform is deployed on Railway:  
**https://thediningdoor-production.up.railway.app**

---

## 📄 License

This project was developed for academic purposes at Dongshin University.  
Master Software Design I · 2024

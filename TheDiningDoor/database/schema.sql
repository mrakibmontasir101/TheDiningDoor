-- ============================================================
--  THE DINING DOOR — Database Schema
--  MySQL 8.0+ / MariaDB 10.6+
--  Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS dining_door CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dining_door;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(60)  NOT NULL,
  last_name     VARCHAR(60)  NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('customer','owner','delivery','admin') NOT NULL DEFAULT 'customer',
  profile_image VARCHAR(500),
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

-- ── RESTAURANTS ───────────────────────────────────────────────
CREATE TABLE restaurants (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  owner_id         INT NOT NULL,
  name             VARCHAR(120) NOT NULL,
  description      TEXT,
  address          VARCHAR(300) NOT NULL,
  latitude         DECIMAL(10,8),
  longitude        DECIMAL(11,8),
  phone            VARCHAR(20),
  cuisine_type     VARCHAR(60),
  business_license VARCHAR(30),
  logo_url         VARCHAR(500),
  cover_image_url  VARCHAR(500),
  average_rating   DECIMAL(3,2) DEFAULT 0.00,
  kitchen_status   ENUM('idle','preparing','ready','closed') DEFAULT 'idle',
  is_active        TINYINT(1) DEFAULT 1,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner    (owner_id),
  INDEX idx_cuisine  (cuisine_type),
  INDEX idx_location (latitude, longitude)
);

-- ── MENU ITEMS ────────────────────────────────────────────────
CREATE TABLE menu_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name          VARCHAR(120) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,0) NOT NULL,
  category      VARCHAR(60),
  image_url     VARCHAR(500),
  is_available  TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant (restaurant_id)
);

-- ── ORDERS ────────────────────────────────────────────────────
CREATE TABLE orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  customer_id      INT NOT NULL,
  restaurant_id    INT NOT NULL,
  delivery_user_id INT,
  total_price      DECIMAL(10,0) NOT NULL,
  delivery_address VARCHAR(300),
  status           ENUM('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled')
                   NOT NULL DEFAULT 'pending',
  payment_status   ENUM('unpaid','paid','refunded') DEFAULT 'unpaid',
  notes            TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id)      REFERENCES users(id),
  FOREIGN KEY (restaurant_id)    REFERENCES restaurants(id),
  FOREIGN KEY (delivery_user_id) REFERENCES users(id),
  INDEX idx_customer    (customer_id),
  INDEX idx_restaurant  (restaurant_id),
  INDEX idx_delivery    (delivery_user_id),
  INDEX idx_status      (status)
);

-- ── ORDER ITEMS ───────────────────────────────────────────────
CREATE TABLE order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  price        DECIMAL(10,0) NOT NULL,
  FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- ── MESSAGES ──────────────────────────────────────────────────
CREATE TABLE messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  order_id    INT,
  content     TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_sender   (sender_id),
  INDEX idx_receiver (receiver_id)
);

-- ── RATINGS ───────────────────────────────────────────────────
CREATE TABLE ratings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL UNIQUE,   -- One rating per order (BR-3)
  customer_id   INT NOT NULL,
  restaurant_id INT NOT NULL,
  score         TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)      REFERENCES orders(id),
  FOREIGN KEY (customer_id)   REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  INDEX idx_restaurant (restaurant_id)
);

-- ── VIDEO ADS ─────────────────────────────────────────────────
CREATE TABLE video_ads (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  title         VARCHAR(150) NOT NULL,
  file_url      VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration_sec  INT,
  view_count    INT DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant (restaurant_id)
);

-- ── DELIVERY PROFILES ─────────────────────────────────────────
CREATE TABLE delivery_profiles (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL UNIQUE,
  vehicle_type   ENUM('motorcycle','bicycle','scooter','car') DEFAULT 'motorcycle',
  is_online      TINYINT(1) DEFAULT 0,
  current_lat    DECIMAL(10,8),
  current_lng    DECIMAL(11,8),
  total_deliveries INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── SEED: Demo admin account ──────────────────────────────────
-- Password: Admin@1234 (bcrypt hash)
INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
VALUES ('System', 'Admin', 'admin@diningdoor.com', '010-0000-0000',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGMdRbFNLcE5R4k3c.DFJhFHTkC', 'admin');

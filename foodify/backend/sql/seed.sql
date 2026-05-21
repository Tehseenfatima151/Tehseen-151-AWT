USE foodify;

-- Demo restaurant users (password: 12345678 for all, bcrypt hash)
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Spice Hub Owner', 'spicehub@foodify.demo', '$2b$10$Mb3WyIBv3gU6P5khuqt8RO7Idmq.cKJmz05Ksn8OCwejFqYj2e.uK', 'restaurant'),
  ('Burger Point Owner', 'burgerpoint@foodify.demo', '$2b$10$Mb3WyIBv3gU6P5khuqt8RO7Idmq.cKJmz05Ksn8OCwejFqYj2e.uK', 'restaurant'),
  ('Pasta House Owner', 'pastahouse@foodify.demo', '$2b$10$Mb3WyIBv3gU6P5khuqt8RO7Idmq.cKJmz05Ksn8OCwejFqYj2e.uK', 'restaurant');

-- Restaurants linked to the users above
INSERT IGNORE INTO restaurants (user_id, name, description)
SELECT u.id, 'Spice Hub', 'Indian and desi favorites'
FROM users u
WHERE u.email = 'spicehub@foodify.demo' AND u.role = 'restaurant';

INSERT IGNORE INTO restaurants (user_id, name, description)
SELECT u.id, 'Burger Point', 'Fresh burgers and fries'
FROM users u
WHERE u.email = 'burgerpoint@foodify.demo' AND u.role = 'restaurant';

INSERT IGNORE INTO restaurants (user_id, name, description)
SELECT u.id, 'Pasta House', 'Italian pasta and sauces'
FROM users u
WHERE u.email = 'pastahouse@foodify.demo' AND u.role = 'restaurant';

-- Menu items for Spice Hub
INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'Chicken Biryani', 8.99, 'Aromatic basmati rice with chicken'
FROM restaurants r WHERE r.name = 'Spice Hub'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'Chicken Biryani'
  );

INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'Paneer Tikka', 6.49, 'Grilled cottage cheese with spices'
FROM restaurants r WHERE r.name = 'Spice Hub'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'Paneer Tikka'
  );

INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'Masala Dosa', 5.75, 'Crispy dosa with potato masala'
FROM restaurants r WHERE r.name = 'Spice Hub'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'Masala Dosa'
  );

-- Menu items for Burger Point
INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'Classic Beef Burger', 7.49, 'Grilled beef patty with lettuce and cheese'
FROM restaurants r WHERE r.name = 'Burger Point'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'Classic Beef Burger'
  );

INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'Crispy Chicken Burger', 6.99, 'Fried chicken burger with mayo'
FROM restaurants r WHERE r.name = 'Burger Point'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'Crispy Chicken Burger'
  );

INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'French Fries', 2.99, 'Crispy salted fries'
FROM restaurants r WHERE r.name = 'Burger Point'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'French Fries'
  );

-- Menu items for Pasta House
INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'Creamy Alfredo Pasta', 8.49, 'Pasta in rich alfredo sauce'
FROM restaurants r WHERE r.name = 'Pasta House'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'Creamy Alfredo Pasta'
  );

INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'Arrabbiata Pasta', 7.99, 'Spicy tomato basil pasta'
FROM restaurants r WHERE r.name = 'Pasta House'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'Arrabbiata Pasta'
  );

INSERT INTO menu_items (restaurant_id, name, price, description)
SELECT r.id, 'Garlic Bread', 3.49, 'Toasted bread with garlic butter'
FROM restaurants r WHERE r.name = 'Pasta House'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name = 'Garlic Bread'
  );

-- Demo customer user (password: 12345678)
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Demo Customer', 'customer@foodify.demo', '$2b$10$Mb3WyIBv3gU6P5khuqt8RO7Idmq.cKJmz05Ksn8OCwejFqYj2e.uK', 'customer');

-- Sample orders so restaurant dashboards show data instantly
INSERT INTO orders (user_id, restaurant_id, total_price, status)
SELECT u.id, r.id, 15.48, 'pending'
FROM users u
JOIN restaurants r ON r.name = 'Spice Hub'
WHERE u.email = 'customer@foodify.demo' AND u.role = 'customer'
  AND NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = u.id AND o.restaurant_id = r.id AND o.total_price = 15.48 AND o.status = 'pending'
  );

INSERT INTO orders (user_id, restaurant_id, total_price, status)
SELECT u.id, r.id, 10.48, 'accepted'
FROM users u
JOIN restaurants r ON r.name = 'Burger Point'
WHERE u.email = 'customer@foodify.demo' AND u.role = 'customer'
  AND NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = u.id AND o.restaurant_id = r.id AND o.total_price = 10.48 AND o.status = 'accepted'
  );

-- Order items for Spice Hub pending order (Chicken Biryani x1, Paneer Tikka x1)
INSERT INTO order_items (order_id, item_id, quantity)
SELECT o.id, m.id, 1
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN restaurants r ON r.id = o.restaurant_id
JOIN menu_items m ON m.restaurant_id = r.id AND m.name = 'Chicken Biryani'
WHERE u.email = 'customer@foodify.demo' AND r.name = 'Spice Hub' AND o.total_price = 15.48 AND o.status = 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.item_id = m.id
  );

INSERT INTO order_items (order_id, item_id, quantity)
SELECT o.id, m.id, 1
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN restaurants r ON r.id = o.restaurant_id
JOIN menu_items m ON m.restaurant_id = r.id AND m.name = 'Paneer Tikka'
WHERE u.email = 'customer@foodify.demo' AND r.name = 'Spice Hub' AND o.total_price = 15.48 AND o.status = 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.item_id = m.id
  );

-- Order items for Burger Point accepted order (Classic Beef Burger x1, French Fries x1)
INSERT INTO order_items (order_id, item_id, quantity)
SELECT o.id, m.id, 1
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN restaurants r ON r.id = o.restaurant_id
JOIN menu_items m ON m.restaurant_id = r.id AND m.name = 'Classic Beef Burger'
WHERE u.email = 'customer@foodify.demo' AND r.name = 'Burger Point' AND o.total_price = 10.48 AND o.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.item_id = m.id
  );

INSERT INTO order_items (order_id, item_id, quantity)
SELECT o.id, m.id, 1
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN restaurants r ON r.id = o.restaurant_id
JOIN menu_items m ON m.restaurant_id = r.id AND m.name = 'French Fries'
WHERE u.email = 'customer@foodify.demo' AND r.name = 'Burger Point' AND o.total_price = 10.48 AND o.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.item_id = m.id
  );

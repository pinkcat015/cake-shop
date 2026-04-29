-- Initial Database Schema for Cake Shop
-- Created: 2026-04-29

CREATE DATABASE IF NOT EXISTS cakeshop;
USE cakeshop;

-- ROLE
CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- USER
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- CUSTOMER
CREATE TABLE Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- EMPLOYEE
CREATE TABLE Employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- CATEGORY
CREATE TABLE Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- PRODUCT
CREATE TABLE Product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image TEXT,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
);

-- Add additional product columns
ALTER TABLE Product
ADD COLUMN ingredients TEXT NULL AFTER description,
ADD COLUMN nutrition TEXT NULL AFTER ingredients;

-- INVENTORY
CREATE TABLE Inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNIQUE,
    quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-- VOUCHER
CREATE TABLE Voucher (
    voucher_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    discount DECIMAL(5,2),
    expiry_date DATE
);

-- ORDER
CREATE TABLE `Order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED') DEFAULT 'PENDING',
    total_price DECIMAL(10,2),
    voucher_id INT,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (voucher_id) REFERENCES Voucher(voucher_id)
);

-- ORDER DETAIL
CREATE TABLE OrderDetail (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    UNIQUE(order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-- PAYMENT
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNIQUE,
    method VARCHAR(50),
    status ENUM('PENDING','PAID','FAILED') DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id)
);

-- PROMOTION
CREATE TABLE Promotion (
    promotion_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    discount DECIMAL(5,2) NOT NULL,
    start_date DATE,
    end_date DATE
);

-- PRODUCT_PROMOTION
CREATE TABLE ProductPromotion (
    product_id INT,
    promotion_id INT,
    PRIMARY KEY (product_id, promotion_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (promotion_id) REFERENCES Promotion(promotion_id)
);

-- CART
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNIQUE,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

-- CART_ITEM
CREATE TABLE CartItem (
    cart_id INT,
    product_id INT,
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES Cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-- NUTRITION_FACT
CREATE TABLE NutritionFact (
    nutrition_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(50) NOT NULL,
    unit VARCHAR(20),
    per VARCHAR(50),
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

-- STORE
CREATE TABLE IF NOT EXISTS `Store` (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    open_hours VARCHAR(255) NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_lat_lng (latitude, longitude)
);

-- Expand Order table with store and delivery information
ALTER TABLE `Order`
    ADD COLUMN store_id INT NULL AFTER voucher_id,
    ADD COLUMN delivery_latitude DECIMAL(10,7) NULL AFTER store_id,
    ADD COLUMN delivery_longitude DECIMAL(10,7) NULL AFTER delivery_latitude,
    ADD COLUMN delivery_method ENUM('delivery','pickup') NOT NULL DEFAULT 'delivery' AFTER delivery_longitude,
    ADD CONSTRAINT fk_order_store FOREIGN KEY (store_id) REFERENCES `Store`(store_id);

-- Insert sample stores
INSERT INTO `Store` (name, address, latitude, longitude, open_hours) VALUES
    ('Cake Shop - Central', '123 Le Loi, District 1, HCMC', 10.776889, 106.700806, '08:00-20:00'),
    ('Cake Shop - West', '45 Tran Hung Dao, District 5, HCMC', 10.760000, 106.675000, '08:00-20:00'),
    ('Cake Shop - North', '10 Phan Dinh Phung, Ba Dinh, Hanoi', 21.033333, 105.850000, '08:00-20:00');

-- Insert sample roles
INSERT INTO Role (role_name) VALUES ('customer'), ('employee'), ('admin');

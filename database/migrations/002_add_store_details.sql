-- Add Store Details Columns (phone, rating, description)
-- Created: 2026-04-29
-- Purpose: Extend Store table with contact info, ratings, and descriptions

USE cakeshop;

-- Add new columns to Store table
ALTER TABLE `Store` 
ADD COLUMN phone VARCHAR(20) NULL AFTER address,
ADD COLUMN rating DECIMAL(3,2) NULL DEFAULT 5.00 AFTER phone,
ADD COLUMN description TEXT NULL AFTER rating;

-- Create index for phone lookup if needed
ALTER TABLE `Store` 
ADD INDEX idx_phone (phone);

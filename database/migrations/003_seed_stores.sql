-- Seed Store Details Data
-- Created: 2026-04-29
-- Purpose: Populate phone, rating, and description for existing stores

USE cakeshop;

-- Update Store data with phone, rating, and description
UPDATE `Store` SET 
  phone = CASE 
    WHEN store_id = 1 THEN '(028) 3822-6789'
    WHEN store_id = 2 THEN '(028) 3833-4567'
    WHEN store_id = 3 THEN '(024) 3943-2108'
  END,
  rating = CASE
    WHEN store_id = 1 THEN 4.8
    WHEN store_id = 2 THEN 4.6
    WHEN store_id = 3 THEN 4.7
  END,
  description = CASE
    WHEN store_id = 1 THEN 'Cửa hàng chính tại trung tâm thành phố. Tươi mới hàng ngày, phục vụ tốt.'
    WHEN store_id = 2 THEN 'Chi nhánh phía Tây. Chuyên bánh tươi, ship nhanh.'
    WHEN store_id = 3 THEN 'Chi nhánh Hà Nội. Bánh nhập khẩu chất lượng cao.'
  END
WHERE store_id IN (1, 2, 3);

-- ============================================
-- CHECK & CLEAN: Verify Supabase connection
-- Run this in Supabase SQL Editor to check if you're connected to the right project
-- ============================================

-- STEP 1: Check your project name and URL
SELECT current_database() AS database_name, current_user AS user_role;

-- STEP 2: List ALL tables in public schema
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- STEP 3: Check products table column type (UUID or TEXT?)
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'id';

-- STEP 4: How many products exist?
SELECT count(*) AS product_count FROM public.products;

-- STEP 5: Show all product IDs (to verify if they're TEXT or UUID format)
SELECT id, name FROM public.products LIMIT 10;

-- STEP 6: Check if backup table exists
SELECT CASE 
  WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products_backup') 
  THEN 'products_backup EXISTS' 
  ELSE 'products_backup does NOT exist' 
END AS backup_check;

-- ============================================
-- IF YOU WANT TO DELETE ALL PRODUCTS:
-- Uncomment the lines below (remove -- from start)
-- ============================================

-- Drop backup table if exists
DROP TABLE IF EXISTS public.products_backup;

-- Delete all products
DELETE FROM public.products;

-- Verify empty
SELECT count(*) AS remaining_products FROM public.products;

-- ============================================
-- AFTER DELETE: If you want to add a test product
-- ============================================

INSERT INTO public.products (id, name, brand, category, prices, description, image, trending, stock, created_at)
VALUES (
  'test-product-001',
  'Test iPhone 16',
  'Apple',
  'Phones',
  '{"brandNew": 999, "ukUsed": 799}',
  'This is a test product to verify database connection',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000',
  true,
  10,
  NOW()
);

-- Verify the test product was created
SELECT id, name, brand FROM public.products WHERE id = 'test-product-001';

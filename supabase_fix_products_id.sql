-- ============================================
-- FIX: Change products.id from UUID to TEXT (with data preservation)
-- Run this EXACTLY as-is in Supabase SQL Editor
-- ============================================

-- STEP 1: Back up existing data (if any)
DO $$
DECLARE
  cnt BIGINT;
BEGIN
  SELECT count(*) INTO cnt FROM public.products;
  IF cnt > 0 THEN
    CREATE TABLE public.products_backup AS SELECT * FROM public.products;
    RAISE NOTICE 'Backed up % existing products', cnt;
  ELSE
    RAISE NOTICE 'No existing products to back up';
  END IF;
END $$;

-- STEP 2: Drop RLS policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can modify products" ON public.products;
DROP POLICY IF EXISTS "products allow insert" ON public.products;
DROP POLICY IF EXISTS "products allow update" ON public.products;
DROP POLICY IF EXISTS "products allow delete" ON public.products;

-- STEP 3: Drop foreign key constraints
DO $$ BEGIN
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_product_id_fkey;
  ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'No FK constraints to drop';
END $$;

-- STEP 4: Drop the table
DROP TABLE IF EXISTS public.products CASCADE;

-- STEP 5: Create table with TEXT id
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  prices JSONB DEFAULT '{"brandNew": 0, "ukUsed": 0}',
  specs JSONB DEFAULT '{}',
  description TEXT,
  images JSONB DEFAULT '[]',
  trending BOOLEAN DEFAULT false,
  "isDeal" BOOLEAN DEFAULT false,
  image TEXT,
  rating NUMERIC,
  stock INTEGER DEFAULT 0,
  colors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- STEP 7: Recreate policies
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify products"
  ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'owner', 'worker')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'owner', 'worker')
    )
  );

-- STEP 8: Restore data from backup (if backup exists)
DO $$
DECLARE
  cnt BIGINT;
BEGIN
  -- Check if backup table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products_backup') THEN
    SELECT count(*) INTO cnt FROM public.products_backup;
    IF cnt > 0 THEN
      INSERT INTO public.products (
        id, name, brand, category, prices, specs, description, images,
        trending, "isDeal", image, rating, stock, colors, created_at
      ) SELECT
        id, name, brand, category, prices, specs, description, images,
        trending, "isDeal", image, rating, stock, colors, created_at
      FROM public.products_backup;
      RAISE NOTICE 'Restored % products', cnt;
    END IF;
    DROP TABLE public.products_backup;
  END IF;
END $$;

-- STEP 9: Ensure realtime is enabled
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- STEP 10: Verify
SELECT 'Column type is now: ' || data_type AS status FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'id';
SELECT 'Policies:' || count(*)::text FROM pg_policies WHERE tablename = 'products';
SELECT 'Products count:' || count(*)::text FROM public.products;

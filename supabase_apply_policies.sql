-- ============================================
-- PRODUCTS TABLE RLS POLICIES
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lsrltxnvbmqejbsdirld/editor/new
-- ============================================

-- 1. Ensure products table exists with correct columns
CREATE TABLE IF NOT EXISTS public.products (
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

-- 2. Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. DROP any existing policies (clean slate)
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can modify products" ON public.products;
DROP POLICY IF EXISTS "products allow insert" ON public.products;
DROP POLICY IF EXISTS "products allow update" ON public.products;
DROP POLICY IF EXISTS "products allow delete" ON public.products;

-- 4. Allow anyone to view products (public catalog)
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);

-- 5. Allow admins/owners/workers to INSERT, UPDATE, DELETE
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

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that policies are in place
SELECT policyname, cmd, qual IS NOT NULL as has_using, with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- Verify your current user has the right role
SELECT auth.uid() as user_id, role FROM public.users WHERE id = auth.uid();

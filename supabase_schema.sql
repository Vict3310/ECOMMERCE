-- Supabase Schema Setup for Elite E-Commerce Template

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Profile Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;
CREATE POLICY "Admins can manage all profiles" ON public.users FOR ALL USING (public.get_auth_role() IN ('admin', 'owner'));

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  prices JSONB, -- { "brandNew": 1000, "ukUsed": 800 }
  colors JSONB, -- ["Black", "White"]
  specs JSONB,
  description TEXT,
  images JSONB,
  trending BOOLEAN DEFAULT false,
  "isDeal" BOOLEAN DEFAULT false,
  image TEXT,
  rating NUMERIC,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can modify products" ON public.products;
CREATE POLICY "Admins can modify products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner', 'worker')));

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  email TEXT NOT NULL,
  total NUMERIC NOT NULL,
  items JSONB,
  location TEXT,
  shipping_fee NUMERIC,
  reference TEXT,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- For simplicity, anyone can insert an order (since guests can checkout)
-- For simplicity, anyone can insert an order (since guests can checkout)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
-- Users can view only their own orders by matching auth UID to user email
DROP POLICY IF EXISTS "Users can view their orders" ON public.orders;
CREATE POLICY "Users can view their orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND email = orders.email)
);
-- Admins can view and update all orders
DROP POLICY IF EXISTS "Admins can view and update all orders" ON public.orders;
CREATE POLICY "Admins can view and update all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner', 'worker'))
);

-- 4. Site Settings Table (Key-Value)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can modify site settings" ON public.site_settings;
CREATE POLICY "Admins can modify site settings" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES 
('general', '{"name": "YOUR BRAND NAME", "address": "Suite 12, Elite Plaza", "phone": "+1 234 567 8900", "email": "hello@yourbrand.com"}'),
('heroSlides', '[{"id": "1", "title": "iPhones.", "subtitle": "UK USED & BRAND NEW", "image": "https://images.unsplash.com/photo-1510557880182-3d4d3cba30a8?auto=format&fit=crop&q=80&w=2000", "link": "Phones"}]'),
('feedItems', '[{"id": "1", "title": "iPhone 16 Pro", "image": "https://images.unsplash.com/photo-1510557880182-3d4d3cba30a8?auto=format&fit=crop&q=80&w=1000", "category": "Phones"}]');

-- 5. Chat / Inbox Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id TEXT NOT NULL, -- usually the user's ID or email
  text TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;
CREATE POLICY "Anyone can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view and reply to all chats" ON public.chat_messages;
CREATE POLICY "Admins can view and reply to all chats" ON public.chat_messages FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner', 'worker')));
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chat_messages;
CREATE POLICY "Users can view their own chats" ON public.chat_messages FOR SELECT USING (chat_id = auth.uid()::text);

-- Enable Realtime for all tables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id TEXT NOT NULL,
  uid UUID,
  user_name TEXT,
  rating INTEGER,
  comment TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT true,
  helpful INTEGER DEFAULT 0,
  unhelpful INTEGER DEFAULT 0,
  replies JSONB DEFAULT '[]'::jsonb,
  voted_by JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON public.reviews;
CREATE POLICY "Authenticated users can update reviews" ON public.reviews FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
  END IF;
END $$;

-- 7. Automated User Profile Trigger
-- This ensures every new signup automatically gets a profile in the users table instantly at the database level.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Client')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Storage Buckets Setup
-- Note: Requires pg_crypto and storage schema which are enabled by default in Supabase

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'site-assets'));

-- Authenticated upload access
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND bucket_id IN ('product-images', 'site-assets')
);

-- Admins can update and delete
DROP POLICY IF EXISTS "Admins can update objects" ON storage.objects;
CREATE POLICY "Admins can update objects" ON storage.objects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

DROP POLICY IF EXISTS "Admins can delete objects" ON storage.objects;
CREATE POLICY "Admins can delete objects" ON storage.objects FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- 9. Receipt History Table
CREATE TABLE IF NOT EXISTS public.receipt_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  receipt_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  total NUMERIC NOT NULL,
  status TEXT,
  method TEXT,
  line_items JSONB,
  date TEXT,
  notes TEXT,
  discount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.receipt_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage receipt history" ON public.receipt_history;
CREATE POLICY "Admins can manage receipt history" ON public.receipt_history FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

-- 10. Marketing Contacts Table
CREATE TABLE IF NOT EXISTS public.marketing_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.marketing_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage marketing contacts" ON public.marketing_contacts;
CREATE POLICY "Admins can manage marketing contacts" ON public.marketing_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

-- 11. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
CREATE POLICY "Admins can manage expenses" ON public.expenses FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner', 'worker')));

-- 12. Repair Tickets Table
CREATE TABLE IF NOT EXISTS public.repair_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tracking_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  status TEXT DEFAULT 'Diagnosing', -- Diagnosing, Awaiting Parts, Repairing, Ready, Completed
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  deposit_paid NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage repair tickets" ON public.repair_tickets;
CREATE POLICY "Admins can manage repair tickets" ON public.repair_tickets FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner', 'worker')));

-- Storage Bucket RLS Policies for product-images
-- Copy these to Supabase SQL Editor to fix image upload persistence

CREATE POLICY "Allow public read on product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update their product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid() = owner);

CREATE POLICY "Allow authenticated users to delete their product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid() = owner);



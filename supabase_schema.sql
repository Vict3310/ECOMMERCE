-- Supabase Schema Setup for Elite E-Commerce Template

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Profile Table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE POLICY "Admins can manage all profiles" ON public.users FOR ALL USING (public.get_auth_role() IN ('admin', 'owner'));

-- 2. Products Table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  prices JSONB, -- { "brandNew": 1000, "ukUsed": 800 }
  colors JSONB, -- ["Black", "White"]
  specs JSONB,
  image TEXT,
  rating NUMERIC,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can modify products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

-- 3. Orders Table
CREATE TABLE public.orders (
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
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
-- Users can view only their own orders by matching auth UID to user email
CREATE POLICY "Users can view their orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND email = orders.email)
);
-- Admins can view and update all orders
CREATE POLICY "Admins can view and update all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- 4. Site Settings Table (Key-Value)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can modify site settings" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES 
('general', '{"name": "YOUR BRAND NAME", "address": "Suite 12, Elite Plaza", "phone": "+1 234 567 8900", "email": "hello@yourbrand.com"}'),
('heroSlides', '[{"id": "1", "title": "iPhones.", "subtitle": "UK USED & BRAND NEW", "image": "https://images.unsplash.com/photo-1510557880182-3d4d3cba30a8?auto=format&fit=crop&q=80&w=2000", "link": "Phones"}]'),
('feedItems', '[{"id": "1", "title": "iPhone 16 Pro", "image": "https://images.unsplash.com/photo-1510557880182-3d4d3cba30a8?auto=format&fit=crop&q=80&w=1000", "category": "Phones"}]');

-- 5. Chat / Inbox Table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id TEXT NOT NULL, -- usually the user's ID or email
  text TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and reply to all chats" ON public.chat_messages FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Users can view their own chats" ON public.chat_messages FOR SELECT USING (chat_id = auth.uid()::text);

-- Enable Realtime for all tables
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.site_settings;
alter publication supabase_realtime add table public.chat_messages;

-- 6. Reviews Table
CREATE TABLE public.reviews (
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
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update reviews" ON public.reviews FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

alter publication supabase_realtime add table public.reviews;

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
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'site-assets'));

-- Authenticated upload access
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND bucket_id IN ('product-images', 'site-assets')
);

-- Admins can update and delete
CREATE POLICY "Admins can update objects" ON storage.objects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

CREATE POLICY "Admins can delete objects" ON storage.objects FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- 9. Receipt History Table
CREATE TABLE public.receipt_history (
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
CREATE POLICY "Admins can manage receipt history" ON public.receipt_history FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

-- 10. Marketing Contacts Table
CREATE TABLE public.marketing_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.marketing_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage marketing contacts" ON public.marketing_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'owner')));

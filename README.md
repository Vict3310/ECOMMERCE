# IFECO — Premium E-Commerce Platform

A production-grade React + Vite e-commerce application with **Supabase backend**, real-time sync, admin dashboard, and premium UX. Built for high-end gadget retail (phones, laptops, accessories).

---

## Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19, Vite 5, React Router 7 |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **State** | React Context + localStorage persistence |
| **Styling** | CSS Variables, CSS Modules, Framer Motion, GSAP |
| **Charts** | Recharts (admin analytics) |
| **Forms** | React Quill, React Helmet Async (SEO) |
| **Email** | EmailJS (contact/order notifications) |
| **Icons** | Lucide React |

---

## Features

### Customer Experience
- **Home**: Hero carousel, feed carousel, product recommendations
- **Shop**: Advanced search, filter sidebar (price, brand, condition, storage, color, stock), category chips
- **Product Detail**: Image magnifier, specs comparison, review section, dual pricing (brand-new / UK-used)
- **Cart Drawer**: Persistent side cart with order flow
- **Wishlist**: Folders, device sync, shareable lists
- **Order Tracking**: Real-time order status dashboard
- **Product Comparison**: Side-by-side spec comparison bar
- **Live Chat**: Floating widget with admin inbox
- **Dark/Light Mode**: System-aware, persisted
- **Multi-currency**: NGN/USD with live exchange rate

### Admin Dashboard (`/admin`)
- **Products CRUD**: Modal forms, image upload, inventory intelligence
- **Orders Management**: Status updates, receipt generator, accounting protocol
- **Marketing**: Hero slides, feed items, slider management
- **Analytics**: Revenue charts, stock velocity, customer metrics
- **Site Settings**: Branding, contact info, SEO metadata
- **Chat Inbox**: Real-time customer messages
- **Repair Manager**: Service ticket workflow

### Technical Highlights
- **Lazy-loaded routes** + Suspense boundaries
- **Supabase Realtime** subscriptions (products, orders, settings)
- **Row-Level Security** via `supabase_schema.sql`
- **Input sanitization** & XSS protection (`SecurityUtils`)
- **Error boundaries** + global notification system
- **SEO-ready** dynamic meta tags per route
- **PWA-ready** Vite config

---

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard components
│   ├── cart/           # Cart drawer, order tracking
│   ├── chat/           # Live chat widget
│   ├── home/           # Carousels, recommendations
│   ├── layout/         # Navbar, search, filters, wishlist
│   ├── product/        # Cards, grid, magnifier, reviews, comparison
│   └── ui/             # Loaders, lightbox, error boundary, loyalty, inventory
├── config/             # Template defaults (branding, contact)
├── context/            # AppContext — global state + Supabase sync
├── data/               # Initial product catalog
├── pages/              # Route-level components
├── utils/              # Order IDs, paths, image compression, security
├── supabase.js         # Supabase client
└── main.jsx            # Entry point
```

---

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Vict3310/ECOMMERCE.git
cd ECOMMERCE
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

### 3. Database Setup
Run `supabase_schema.sql` in your Supabase SQL editor. It creates:
- `products`, `orders`, `users`, `site_settings`, `chat_messages`
- RLS policies, indexes, triggers

### 4. Dev Server
```bash
npm run dev
```

### 5. Build
```bash
npm run build
npm run preview
```

---

## Key Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |

---

## Deployment

**Vercel** (recommended):
- Connect repo
- Add env vars in Vercel dashboard
- `vercel.json` handles SPA routing

**Any static host**: Output is in `dist/`

---

## Admin Access

1. Sign up via UI
2. In Supabase dashboard, edit `users` table → set `role = 'admin'` for your user
3. Visit `/admin`

---

## License

Private / Proprietary — **IFECO / DERIN TECH**

---

> Built with precision. Deployed with confidence.
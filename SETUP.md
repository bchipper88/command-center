# Command Center Setup

## Quick Setup (5 minutes)

### 1. Create Supabase Tables

Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/armreshdoknjkqhikjma/sql/new) and paste this:

```sql
-- Dashboard Goals
CREATE TABLE IF NOT EXISTS dashboard_goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🎯',
  current_value DECIMAL(12,2) DEFAULT 0,
  target_value DECIMAL(12,2) NOT NULL,
  unit TEXT DEFAULT '',
  color TEXT DEFAULT 'cyan',
  goal_type TEXT DEFAULT 'overall',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'P2',
  done BOOLEAN DEFAULT false,
  assignee TEXT,
  category TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_initiatives (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  blockers TEXT,
  next_steps JSONB DEFAULT '[]'::jsonb,
  repo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_accomplishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO dashboard_goals (id, name, icon, current_value, target_value, unit, color, goal_type, sort_order) VALUES
  ('financial', 'Financial Freedom', '💰', 0, 120000, '$', 'green', 'overall', 1),
  ('monthly_revenue', 'Monthly Revenue', '📈', 0, 10000, '$', 'cyan', 'monthly', 2),
  ('email_subscribers', 'Email List', '📧', 1367, 5000, '', 'magenta', 'overall', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO dashboard_initiatives (id, name, status, progress, blockers, next_steps, repo) VALUES
  ('seo', 'Jurassic Apparel SEO', 'active', 20, NULL, '["Post blogs to Shopify", "Write more SEO content"]'::jsonb, NULL),
  ('dashboard', 'Command Center', 'active', 70, 'Need Shopify API key', '["Get API key", "Add revenue tracking"]'::jsonb, 'https://github.com/bchipper88/command-center')
ON CONFLICT (id) DO NOTHING;
```

Click "Run" ✓

### 2. Get Shopify Admin API Key (Optional but Recommended)

1. Go to [Shopify Admin > Settings > Apps](https://admin.shopify.com/store/jurassicapparel/settings/apps)
2. Click "Develop apps" 
3. Create a new app called "Command Center"
4. Give it read access to: Orders, Products, Analytics
5. Copy the Admin API access token
6. Add it to Vercel environment variables as `SHOPIFY_ACCESS_TOKEN`

### 3. Access Your Dashboard

🔗 **Live URL:** https://command-center-kappa-eight.vercel.app

---

## Features

- 💰 Financial freedom progress tracker
- 📧 Klaviyo subscriber metrics (LIVE)
- 📬 Gmail integration (LIVE)
- 📅 Calendar integration (LIVE)
- 📋 Task management with priorities
- 🚀 Initiative tracking
- ⚡ Quick access to all your tools
- 🔔 Alert system for urgent items

## Coming Soon

- Real Shopify revenue data (needs API key)
- Instagram follower metrics
- Daily accomplishment auto-logging
- Mobile PWA support

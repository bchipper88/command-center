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

-- Dashboard Tasks
CREATE TABLE IF NOT EXISTS dashboard_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2')),
  done BOOLEAN DEFAULT false,
  assignee TEXT CHECK (assignee IN ('John', 'Bellatrix', NULL)),
  category TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Initiatives
CREATE TABLE IF NOT EXISTS dashboard_initiatives (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  progress INTEGER DEFAULT 0,
  blockers TEXT,
  next_steps JSONB DEFAULT '[]'::jsonb,
  repo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Accomplishments  
CREATE TABLE IF NOT EXISTS dashboard_accomplishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert seed goals
INSERT INTO dashboard_goals (id, name, icon, current_value, target_value, unit, color, goal_type, sort_order) VALUES
  ('financial', 'Financial Freedom', '💰', 0, 120000, '$', 'green', 'overall', 1),
  ('monthly_revenue', 'Monthly Revenue', '📈', 0, 10000, '$', 'cyan', 'monthly', 2),
  ('email_subscribers', 'Email List', '📧', 1367, 5000, '', 'magenta', 'overall', 3)
ON CONFLICT (id) DO UPDATE SET
  current_value = EXCLUDED.current_value,
  target_value = EXCLUDED.target_value;

-- Insert seed initiatives
INSERT INTO dashboard_initiatives (id, name, status, progress, blockers, next_steps, repo) VALUES
  ('seo', 'Jurassic Apparel SEO', 'active', 20, NULL, 
   '["Post 2 draft blogs to Shopify", "Write 3 more blog posts (SD<20)", "Track keyword rankings"]'::jsonb,
   'https://github.com/BCHIPPER88'),
  ('dashboard', 'Command Center', 'active', 70, 'Need Shopify Admin API key for real revenue', 
   '["Get Shopify API key from John", "Add real-time order notifications", "Set up mobile PWA"]'::jsonb,
   'https://github.com/bchipper88/command-center'),
  ('healthy-remote', 'Healthy Remote App', 'paused', 78, NULL, 
   '["Resume when prioritized", "Complete UI polish", "Beta testing"]'::jsonb,
   'https://github.com/bchipper88/healthy-remote')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  progress = EXCLUDED.progress,
  blockers = EXCLUDED.blockers,
  next_steps = EXCLUDED.next_steps;

-- Insert seed tasks
INSERT INTO dashboard_tasks (text, priority, done, assignee, category) VALUES
  ('Get Shopify Admin API key', 'P0', false, 'John', 'business'),
  ('Post SEO blogs to Shopify', 'P1', false, 'John', 'marketing'),
  ('Review Command Center v2', 'P1', false, 'John', 'development'),
  ('Create new Facebook page', 'P2', false, 'John', 'marketing'),
  ('Write 3 more SEO blog posts', 'P1', false, 'Bellatrix', 'marketing'),
  ('Set up Instagram API', 'P2', false, 'Bellatrix', 'development')
ON CONFLICT DO NOTHING;

-- Insert today's accomplishments
INSERT INTO dashboard_accomplishments (time, text, type, category, date) VALUES
  ('18:45', 'Built Command Center v2.0 with cyberpunk theme', 'code', 'development', CURRENT_DATE),
  ('19:20', 'Integrated Gmail & Calendar OAuth', 'code', 'development', CURRENT_DATE),
  ('19:45', 'Added Klaviyo API integration', 'code', 'development', CURRENT_DATE),
  ('20:10', 'Created goals tracking system with Supabase', 'code', 'development', CURRENT_DATE),
  ('20:30', 'Fixed build errors and deployed to Vercel', 'deploy', 'development', CURRENT_DATE),
  ('20:45', 'Major overhaul: Money hero, quick actions, alerts', 'code', 'development', CURRENT_DATE)
ON CONFLICT DO NOTHING;

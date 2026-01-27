-- Dashboard Tasks
CREATE TABLE IF NOT EXISTS dashboard_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2')),
  done BOOLEAN DEFAULT false,
  assignee TEXT CHECK (assignee IN ('John', 'Bellatrix', NULL)),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Accomplishments  
CREATE TABLE IF NOT EXISTS dashboard_accomplishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert seed data for tasks
INSERT INTO dashboard_tasks (text, priority, done, assignee) VALUES
  ('Get Shopify Admin API key', 'P0', false, 'John'),
  ('Post blogs to Shopify', 'P1', false, 'John'),
  ('Review Command Center dashboard', 'P1', false, 'John'),
  ('Call suit place', 'P2', false, 'John'),
  ('Create Facebook page for JA', 'P2', false, 'John'),
  ('Write 3 more SEO blog posts', 'P1', false, 'Bellatrix'),
  ('Set up follower milestone alerts', 'P2', false, 'Bellatrix')
ON CONFLICT DO NOTHING;

-- Insert seed data for initiatives
INSERT INTO dashboard_initiatives (id, name, status, progress, blockers, next_steps) VALUES
  ('seo', 'Jurassic Apparel SEO', 'active', 15, NULL, '["Post Blog #1 and #2 to Shopify", "Write 3 more blog posts targeting SD<20 keywords", "Set up rank tracking for target keywords"]'::jsonb),
  ('dashboard', 'Command Center Dashboard', 'active', 40, 'Shopify API key needed for real revenue data', '["Migrate to Supabase", "Add Gmail integration", "Connect Google Calendar"]'::jsonb),
  ('healthy-remote', 'Healthy Remote App', 'paused', 78, NULL, '["Resume development when prioritized", "Complete remaining UI screens", "Beta test with 5 users"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

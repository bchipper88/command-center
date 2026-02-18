-- Create agents table for The Dark Lord's Court
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  codename TEXT,
  role TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('command', 'ceo', 'operative')),
  site_id TEXT REFERENCES sites(id),
  source TEXT, -- HP, GoT, Marvel, etc.
  soul TEXT, -- The agent's personality/soul description
  avatar TEXT, -- Emoji or image URL
  status TEXT DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'sleeping', 'summoned')),
  tasks_completed INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow read access" ON agents FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access" ON agents FOR ALL USING (auth.role() = 'service_role');

-- Create index for quick lookups
CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_agents_site_id ON agents(site_id);
CREATE INDEX idx_agents_status ON agents(status);

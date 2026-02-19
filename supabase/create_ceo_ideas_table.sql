-- CEO Ideas Backlog Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ceo_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  
  -- Idea details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,  -- content, seo, marketing, partnerships, product, growth
  priority TEXT DEFAULT 'medium',  -- high, medium, low
  effort TEXT DEFAULT 'medium',  -- low, medium, high
  
  -- Status tracking
  status TEXT DEFAULT 'proposed',  -- proposed, approved, in_progress, completed, rejected
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ceo_ideas_site_id ON ceo_ideas(site_id);
CREATE INDEX IF NOT EXISTS idx_ceo_ideas_status ON ceo_ideas(status);
CREATE INDEX IF NOT EXISTS idx_ceo_ideas_priority ON ceo_ideas(priority);
CREATE INDEX IF NOT EXISTS idx_ceo_ideas_created ON ceo_ideas(created_at DESC);

-- RLS
ALTER TABLE ceo_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for ceo_ideas" ON ceo_ideas FOR ALL USING (true);

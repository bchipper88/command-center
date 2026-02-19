-- CEO Weekly Reviews Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ceo_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  agent_id UUID REFERENCES agents(id),
  agent_name TEXT NOT NULL,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Review sections
  summary TEXT,                    -- Overall business health summary
  wins TEXT[],                     -- What went well this week
  challenges TEXT[],               -- Current challenges/blockers
  metrics JSONB DEFAULT '{}',      -- Key metrics snapshot (traffic, rankings, etc.)
  
  -- Ideas (3-5 per review)
  ideas JSONB DEFAULT '[]',        -- Array of {title, description, priority, category, effort}
  
  -- Meta
  status TEXT DEFAULT 'draft',     -- draft, published, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ceo_reviews_site_id ON ceo_reviews(site_id);
CREATE INDEX IF NOT EXISTS idx_ceo_reviews_date ON ceo_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_ceo_reviews_agent ON ceo_reviews(agent_name);

-- RLS
ALTER TABLE ceo_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for ceo_reviews" ON ceo_reviews FOR ALL USING (true);

-- Example idea structure:
-- {
--   "title": "Add local event calendar integration",
--   "description": "Partner with local event venues to auto-populate upcoming events",
--   "priority": "high",
--   "category": "content",
--   "effort": "medium"
-- }

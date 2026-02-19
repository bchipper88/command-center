-- Page Grades table for Jovie's Christmas site review
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS page_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  title TEXT,
  seo_score INT CHECK (seo_score >= 0 AND seo_score <= 100),
  content_quality_score INT CHECK (content_quality_score >= 0 AND content_quality_score <= 100),
  content_length_score INT CHECK (content_length_score >= 0 AND content_length_score <= 100),
  pseo_score INT CHECK (pseo_score >= 0 AND pseo_score <= 100),
  formatting_score INT CHECK (formatting_score >= 0 AND formatting_score <= 100),
  completeness_score INT CHECK (completeness_score >= 0 AND completeness_score <= 100),
  overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
  word_count INT,
  notes TEXT,
  graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(site_id, path)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_page_grades_site ON page_grades(site_id);
CREATE INDEX IF NOT EXISTS idx_page_grades_overall ON page_grades(overall_score);

-- Enable RLS but allow service role full access
ALTER TABLE page_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access" ON page_grades
  FOR ALL USING (true) WITH CHECK (true);

-- Projects and Project Tasks tables for Command Center
-- Run this in Supabase SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'blocked', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  site_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_site_id ON projects(site_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);

-- Enable RLS (but allow all for now)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all on project_tasks" ON project_tasks FOR ALL USING (true);

-- Seed data: 3 initial projects

-- 1. AI YouTube Video - Jurassic Apparel
INSERT INTO projects (name, description, status, priority, site_id) VALUES
('AI YouTube Video - Jurassic Apparel', 'Create an AI-generated YouTube video showcasing Jurassic Apparel products and brand story', 'planning', 'high', 'jurassic');

INSERT INTO project_tasks (project_id, title, sort_order) VALUES
((SELECT id FROM projects WHERE name = 'AI YouTube Video - Jurassic Apparel'), 'Script outline', 1),
((SELECT id FROM projects WHERE name = 'AI YouTube Video - Jurassic Apparel'), 'Record footage', 2),
((SELECT id FROM projects WHERE name = 'AI YouTube Video - Jurassic Apparel'), 'Edit video', 3),
((SELECT id FROM projects WHERE name = 'AI YouTube Video - Jurassic Apparel'), 'Upload and optimize', 4),
((SELECT id FROM projects WHERE name = 'AI YouTube Video - Jurassic Apparel'), 'Promote', 5);

-- 2. AI Life Coach App
INSERT INTO projects (name, description, status, priority) VALUES
('AI Life Coach App', 'Build a mobile app for AI-powered life coaching with goal tracking, habit monitoring, and personalized guidance', 'planning', 'high');

INSERT INTO project_tasks (project_id, title, sort_order) VALUES
((SELECT id FROM projects WHERE name = 'AI Life Coach App'), 'Define MVP features', 1),
((SELECT id FROM projects WHERE name = 'AI Life Coach App'), 'Design UI mockups', 2),
((SELECT id FROM projects WHERE name = 'AI Life Coach App'), 'Build backend', 3),
((SELECT id FROM projects WHERE name = 'AI Life Coach App'), 'Build frontend', 4),
((SELECT id FROM projects WHERE name = 'AI Life Coach App'), 'Beta testing', 5);

-- 3. Digital Products - Jurassic Apparel
INSERT INTO projects (name, description, status, priority, site_id) VALUES
('Digital Products - Jurassic Apparel', 'Create and sell digital products (wallpapers, coloring pages, printables) to diversify revenue', 'planning', 'medium', 'jurassic');

INSERT INTO project_tasks (project_id, title, sort_order) VALUES
((SELECT id FROM projects WHERE name = 'Digital Products - Jurassic Apparel'), 'Research digital product ideas', 1),
((SELECT id FROM projects WHERE name = 'Digital Products - Jurassic Apparel'), 'Create first product', 2),
((SELECT id FROM projects WHERE name = 'Digital Products - Jurassic Apparel'), 'Set up delivery system', 3),
((SELECT id FROM projects WHERE name = 'Digital Products - Jurassic Apparel'), 'Launch and market', 4);

-- Agent Activity Log Table
-- Tracks individual tasks and messages per agent

CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  site_id TEXT,
  
  -- Event details
  event_type TEXT NOT NULL,  -- task_completed, message_sent, pr_created, etc.
  title TEXT NOT NULL,
  description TEXT,
  
  -- Categorization
  category TEXT,  -- task, message, deployment, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_activity_agent_id ON agent_activity(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_agent_name ON agent_activity(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_activity_category ON agent_activity(category);
CREATE INDEX IF NOT EXISTS idx_agent_activity_created ON agent_activity(created_at DESC);

-- RLS
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for agent_activity" ON agent_activity FOR ALL USING (true);

-- View for agent stats (tasks_completed, messages_sent)
CREATE OR REPLACE VIEW agent_stats AS
SELECT 
  agent_id,
  agent_name,
  COUNT(*) FILTER (WHERE category = 'task') as tasks_completed,
  COUNT(*) FILTER (WHERE category = 'message') as messages_sent,
  MAX(created_at) as last_active_at
FROM agent_activity
GROUP BY agent_id, agent_name;

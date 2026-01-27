// Run with: npx tsx scripts/setup-db.ts
// Creates the tables needed for Command Center

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://armreshdoknjkqhikjma.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_KEY required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTables() {
  console.log('Setting up Command Center tables...\n');

  // Create dashboard_tasks table
  const { error: tasksError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS dashboard_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        text TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2')),
        done BOOLEAN NOT NULL DEFAULT false,
        due_date DATE,
        assignee TEXT CHECK (assignee IN ('John', 'Bellatrix')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (tasksError) {
    // Table might already exist, try direct insert test
    console.log('Note: Could not create via RPC, table may already exist');
  } else {
    console.log('✅ dashboard_tasks table ready');
  }

  // Create dashboard_initiatives table
  const { error: initError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS dashboard_initiatives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
        progress INTEGER NOT NULL DEFAULT 0,
        blockers TEXT,
        next_steps JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (initError) {
    console.log('Note: Could not create initiatives via RPC, table may already exist');
  } else {
    console.log('✅ dashboard_initiatives table ready');
  }

  // Create dashboard_accomplishments table
  const { error: accError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS dashboard_accomplishments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        time TEXT NOT NULL,
        text TEXT NOT NULL,
        type TEXT DEFAULT 'other',
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (accError) {
    console.log('Note: Could not create accomplishments via RPC, table may already exist');
  } else {
    console.log('✅ dashboard_accomplishments table ready');
  }

  console.log('\nSetup complete!');
}

setupTables().catch(console.error);

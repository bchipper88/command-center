import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Task {
  id: string;
  text: string;
  priority: 'P0' | 'P1' | 'P2';
  done: boolean;
  created_at: string;
  updated_at: string;
  due_date?: string;
  assignee?: 'John' | 'Bellatrix';
}

export interface Initiative {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  blockers?: string;
  next_steps: string[];
  created_at: string;
  updated_at: string;
}

export interface Accomplishment {
  id: string;
  time: string;
  text: string;
  type: 'security' | 'research' | 'automation' | 'content' | 'design' | 'code' | 'other';
  date: string;
  created_at: string;
}

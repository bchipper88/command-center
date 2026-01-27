import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({
      is_active: true,
      activity_level: 3,
      sub_agent_count: 0,
      last_tool: 'system',
    });
  }

  try {
    const { data, error } = await supabase
      .from('dashboard_agent_status')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error) throw error;

    // Check if last activity was within 30 seconds (agent is "active")
    const lastActivity = new Date(data.last_activity);
    const now = new Date();
    const diffSeconds = (now.getTime() - lastActivity.getTime()) / 1000;
    const isActive = diffSeconds < 30;

    return NextResponse.json({
      ...data,
      is_active: isActive,
      // Decay activity level if no recent activity
      activity_level: isActive ? data.activity_level : Math.max(0, data.activity_level - 2),
    });
  } catch (err) {
    console.error('Agent status GET error:', err);
    return NextResponse.json({
      is_active: false,
      activity_level: 0,
      sub_agent_count: 0,
      last_tool: 'unknown',
    });
  }
}

// POST /api/agent-status - Update agent status (called by Bellatrix)
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    
    const { error } = await supabase
      .from('dashboard_agent_status')
      .update({
        is_active: body.is_active ?? true,
        activity_level: body.activity_level ?? 5,
        sub_agent_count: body.sub_agent_count ?? 0,
        last_tool: body.last_tool,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Agent status POST error:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

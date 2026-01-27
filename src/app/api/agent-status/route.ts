import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  // Default response - Bellatrix is always "online" when the dashboard loads
  const defaultStatus = {
    online: true,
    currentTask: null,
    sessionStart: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(defaultStatus);
  }

  try {
    const { data, error } = await supabase
      .from('dashboard_agent_status')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error) {
      // Table might not exist yet
      return NextResponse.json(defaultStatus);
    }

    return NextResponse.json({
      online: data.is_active ?? true,
      currentTask: data.current_task || null,
      sessionStart: data.session_start || new Date().toISOString(),
      lastActivity: data.last_activity,
    });
  } catch (err) {
    console.error('Agent status GET error:', err);
    return NextResponse.json(defaultStatus);
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
    
    // Upsert the status
    const { error } = await supabase
      .from('dashboard_agent_status')
      .upsert({
        id: 'main',
        is_active: body.online ?? true,
        current_task: body.currentTask || null,
        session_start: body.sessionStart || new Date().toISOString(),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Agent status POST error:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

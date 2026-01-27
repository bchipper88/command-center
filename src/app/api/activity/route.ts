import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET /api/activity - Get recent agent activity
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json([
      { tool: 'system', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), desc: 'Supabase not configured' },
    ]);
  }

  try {
    const { data, error } = await supabase
      .from('dashboard_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const activities = (data || []).map(item => ({
      tool: item.tool,
      time: new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      desc: item.description,
    }));

    return NextResponse.json(activities);
  } catch (err) {
    console.error('Activity GET error:', err);
    return NextResponse.json([]);
  }
}

// POST /api/activity - Log new activity (called by Bellatrix)
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('dashboard_activity')
      .insert({
        tool: body.tool,
        description: body.description || body.desc,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Activity POST error:', err);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}

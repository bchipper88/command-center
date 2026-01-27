import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET /api/subagents - Get active sub-agents
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from('dashboard_subagents')
      .select('*')
      .eq('status', 'running')
      .order('started_at', { ascending: true })
      .limit(5);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Subagents GET error:', err);
    return NextResponse.json([]);
  }
}

// POST /api/subagents - Register a new sub-agent
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('dashboard_subagents')
      .upsert({
        id: body.id,
        label: body.label,
        task: body.task,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Subagents POST error:', err);
    return NextResponse.json({ error: 'Failed to register sub-agent' }, { status: 500 });
  }
}

// DELETE /api/subagents - Mark sub-agent as completed
export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Delete specific sub-agent
      await supabase.from('dashboard_subagents').delete().eq('id', id);
    } else {
      // Clear all completed/stale sub-agents
      await supabase.from('dashboard_subagents').delete().neq('status', 'running');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subagents DELETE error:', err);
    return NextResponse.json({ error: 'Failed to remove sub-agent' }, { status: 500 });
  }
}

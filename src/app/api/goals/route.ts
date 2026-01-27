import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET /api/goals - Get all goals
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json([
      { id: 'financial', name: 'Financial Freedom', icon: '💰', current_value: 0, target_value: 120000, unit: '$', color: 'green' },
    ]);
  }

  try {
    const { data, error } = await supabase
      .from('dashboard_goals')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Goals GET error:', err);
    return NextResponse.json([]);
  }
}

// PATCH /api/goals - Update a goal's current value
export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, current_value, target_value } = body;

    const updates: Record<string, unknown> = {};
    if (current_value !== undefined) updates.current_value = current_value;
    if (target_value !== undefined) updates.target_value = target_value;

    const { data, error } = await supabase
      .from('dashboard_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Goals PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

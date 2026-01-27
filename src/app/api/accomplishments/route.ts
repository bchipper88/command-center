import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET /api/accomplishments - Get today's accomplishments
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json([]);
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('dashboard_accomplishments')
      .select('*')
      .eq('date', today)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Accomplishments GET error:', err);
    return NextResponse.json([]);
  }
}

// POST /api/accomplishments - Add new accomplishment
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const now = new Date();
    
    const { data, error } = await supabase
      .from('dashboard_accomplishments')
      .insert({
        time: body.time || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        text: body.text,
        type: body.type || 'other',
        date: body.date || now.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Accomplishments POST error:', err);
    return NextResponse.json({ error: 'Failed to add accomplishment' }, { status: 500 });
  }
}

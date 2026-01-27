import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const FALLBACK_INITIATIVES = [
  { id: 'seo', name: 'Jurassic Apparel SEO', status: 'active', progress: 15, blockers: null, nextSteps: ['Post blogs to Shopify', 'Write more SEO content'] },
  { id: 'dashboard', name: 'Command Center', status: 'active', progress: 45, blockers: 'Need Supabase tables + Vercel env vars', nextSteps: ['Run SQL in Supabase dashboard', 'Add env vars to Vercel'] },
  { id: 'healthy-remote', name: 'Healthy Remote App', status: 'paused', progress: 78, blockers: null, nextSteps: ['Resume when prioritized'] },
];

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(FALLBACK_INITIATIVES);
  }
  
  try {
    const { data, error } = await supabase
      .from('dashboard_initiatives')
      .select('*')
      .order('status', { ascending: true });
    
    if (error) throw error;
    
    const transformed = (data || []).map(item => ({
      ...item,
      nextSteps: item.next_steps || [],
    }));
    
    return NextResponse.json(transformed);
  } catch (err) {
    console.error('Initiatives GET error:', err);
    return NextResponse.json(FALLBACK_INITIATIVES);
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { id, nextSteps, ...updates } = body;
    
    const dbUpdates = {
      ...updates,
      ...(nextSteps ? { next_steps: nextSteps } : {}),
    };
    
    const { data, error } = await supabase
      .from('dashboard_initiatives')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      ...data,
      nextSteps: data.next_steps || [],
    });
  } catch (err) {
    console.error('Initiatives PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update initiative' }, { status: 500 });
  }
}

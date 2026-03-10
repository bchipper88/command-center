import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// This endpoint is called after approval to trigger 1.5 High regeneration
// The actual generation happens via external process (Bellatrix) that polls for pending regenerations

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Missing design id' }, { status: 400 })
    }
    
    // Mark as needing regeneration by setting status to 'regenerating'
    const { error } = await supabase
      .from('tshirt_designs')
      .update({ status: 'regenerating' })
      .eq('id', id)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Queued for 1.5 High regeneration' })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

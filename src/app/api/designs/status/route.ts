import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { id, status, feedback } = await request.json()
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }
    
    const validStatuses = ['pending', 'approved', 'rejected', 'printed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    
    // Build update object
    const updateData: Record<string, string> = { status }
    if (feedback && status === 'rejected') {
      updateData.notes = `FEEDBACK: ${feedback}`
    }
    
    const { error } = await supabase
      .from('tshirt_designs')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

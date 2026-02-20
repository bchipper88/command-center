import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { postId, postTitle, postUrl } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
    }

    // Create a completed task to track review
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: `✅ Reviewed: ${postTitle}`,
        description: `**URL:** ${postUrl}\n\nContent reviewed - no issues found.`,
        status: 'completed',
        assigned_to: null,
        priority: 'low',
        completed_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Failed to mark as reviewed:', error)
      return NextResponse.json({ error: 'Failed to mark as reviewed', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      taskId: data[0]?.id 
    })
  } catch (error: unknown) {
    console.error('Review error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}

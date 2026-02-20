import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { postId, postTitle, postUrl, reviewed } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
    }

    // Update reviewed status in blog_posts table
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ reviewed: reviewed ?? true })
      .eq('id', postId)

    if (updateError) {
      console.error('Failed to update reviewed status:', updateError)
      return NextResponse.json({ error: 'Failed to update reviewed status', details: updateError.message }, { status: 500 })
    }

    // Create a completed task only when marking as reviewed (audit trail)
    if (reviewed !== false) {
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: `✅ Reviewed: ${postTitle}`,
          description: `**URL:** ${postUrl}\n\nContent reviewed - no issues found.`,
          status: 'done',
          assigned_to: 'System',
          priority: 'low',
          completed_at: new Date().toISOString()
        })

      if (taskError) {
        console.error('Failed to create review task:', taskError)
        // Don't fail the request if task creation fails
      }
    }

    return NextResponse.json({ 
      success: true,
      reviewed: reviewed ?? true
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

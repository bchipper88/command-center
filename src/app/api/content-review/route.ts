import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service key for admin operations
const supabaseUrl = 'https://heetkfaggxclbwfrmhln.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZXRrZmFnZ3hjbGJ3ZnJtaGxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM2MjM2NCwiZXhwIjoyMDg2OTM4MzY0fQ.gtiZl6zhq6UKgaUmOqdeKxA7ItZBViwssUIjM7XgBc8'

// Create supabase client with auth disabled for service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

export async function POST(req: NextRequest) {
  try {
    const { postId, postTitle, postUrl, reviewed } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
    }

    // Explicitly handle boolean to avoid any coercion issues
    const reviewedValue = reviewed === false ? false : true

    // Update reviewed status in blog_posts table
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ reviewed: reviewedValue })
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
      reviewed: reviewedValue
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

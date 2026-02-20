import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { postId, postTitle, postUrl, comment, type } = await req.json()

    if (!comment || !type || !postId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (type === 'issue') {
      // Create a task
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: `Content issue: ${postTitle}`,
          description: `**URL:** ${postUrl}\n\n**Issue:**\n${comment}`,
          status: 'todo',
          assigned_to: 'Bellatrix',
          priority: 'medium'
        })
        .select()

      if (error) {
        console.error('Failed to create task:', error)
        return NextResponse.json({ error: 'Failed to create task', details: error.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        type: 'task',
        taskId: data[0]?.id 
      })
    } 
    
    if (type === 'learning') {
      // Store learning as a completed task with special title prefix
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: `✨ Learning: ${postTitle}`,
          description: `**URL:** ${postUrl}\n\n**What worked:**\n${comment}\n\n**Category:** content_quality`,
          status: 'done',
          assigned_to: 'System',
          priority: 'low',
          completed_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Failed to save learning:', error)
        return NextResponse.json({ error: 'Failed to save learning', details: error.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        type: 'learning',
        taskId: data[0]?.id 
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Content comment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}

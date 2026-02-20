import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { writeFileSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'

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
          status: 'pending',
          assigned_to: null, // Can be assigned later
          priority: 'normal'
        })
        .select()

      if (error) {
        console.error('Failed to create task:', error)
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        type: 'task',
        taskId: data[0]?.id 
      })
    } 
    
    if (type === 'learning') {
      // Append to learnings file
      const learningsPath = join(process.env.HOME || '/home/ubuntu', '.openclaw/skills/self-improving-agent/.learnings/LEARNINGS.md')
      
      const timestamp = new Date().toISOString().split('T')[0]
      const entry = `
## Content Quality Learning (${timestamp})

**Post:** ${postTitle}  
**URL:** ${postUrl}

**What worked:**
${comment}

**Category:** content_quality

---

`
      
      if (existsSync(learningsPath)) {
        appendFileSync(learningsPath, entry)
      } else {
        writeFileSync(learningsPath, entry)
      }

      return NextResponse.json({ 
        success: true, 
        type: 'learning' 
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Content comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { data: messages, error } = await supabase
      .from('agent_comms')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ messages: [], error: error.message })
    }

    // Get stats
    const unreadCount = messages?.filter(m => !m.read).length || 0
    const agentStats: Record<string, { sent: number; received: number; unread: number }> = {}
    
    messages?.forEach(m => {
      if (!agentStats[m.sender]) agentStats[m.sender] = { sent: 0, received: 0, unread: 0 }
      if (!agentStats[m.recipient]) agentStats[m.recipient] = { sent: 0, received: 0, unread: 0 }
      agentStats[m.sender].sent++
      agentStats[m.recipient].received++
      if (!m.read) agentStats[m.recipient].unread++
    })

    return NextResponse.json({
      messages,
      stats: {
        total: messages?.length || 0,
        unread: unreadCount,
        byAgent: agentStats
      }
    })
  } catch (error) {
    return NextResponse.json({
      messages: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

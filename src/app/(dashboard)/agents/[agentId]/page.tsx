import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { AgentDetailClient } from './client'

export const dynamic = 'force-dynamic'

export default async function AgentPage({ params }: { params: { agentId: string } }) {
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', params.agentId)
    .single()

  if (!agent) {
    notFound()
  }

  const { data: activities } = await supabase
    .from('agent_activity')
    .select('*')
    .eq('agent_name', agent.name)
    .order('created_at', { ascending: false })
    .limit(50)

  return <AgentDetailClient agent={agent} activities={activities || []} />
}

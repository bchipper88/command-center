import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { AgentDetailClient } from './client'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AgentPage({ params }: { params: { agentId: string } }) {
  noStore()
  
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

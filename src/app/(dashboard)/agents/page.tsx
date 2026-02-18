import { supabase } from '@/lib/supabase'
import { AgentsClient } from './client'

export const dynamic = 'force-dynamic'

type Agent = {
  id: string
  name: string
  codename: string | null
  role: string
  tier: string
  site_id: string | null
  source: string | null
  soul: string | null
  avatar: string | null
  status: string | null
  tasks_completed: number
  messages_sent: number
  last_active_at: string | null
  created_at: string
}

export default async function AgentsPage() {
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .order('tier')
    .order('name') as unknown as { data: Agent[] | null }

  return <AgentsClient agents={agents || []} />
}

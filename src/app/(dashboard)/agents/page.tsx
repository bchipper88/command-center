import { createClient } from '@supabase/supabase-js'
import { AgentsClient } from './client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  // Create fresh client with no caching
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          cache: 'no-store',
          next: { revalidate: 0 }
        } as RequestInit)
      }
    }
  })

  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .order('tier')
    .order('name') as unknown as { data: Agent[] | null }

  return <AgentsClient agents={agents || []} />
}

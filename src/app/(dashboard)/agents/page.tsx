import { supabase, CronJob } from '@/lib/supabase'
import { AgentsClient } from './client'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const { data: cronJobs } = await supabase
    .from('cron_jobs')
    .select('*')
    .order('name') as unknown as { data: CronJob[] | null }

  return <AgentsClient agents={cronJobs || []} />
}

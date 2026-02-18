import { supabase, CronJob } from '@/lib/supabase'
import { OpsClient } from './ops-client'

export const dynamic = 'force-dynamic'

export default async function OpsPage() {
  const { data: cronJobs } = await supabase
    .from('cron_jobs')
    .select('*')
    .order('name') as unknown as { data: CronJob[] | null }

  return <OpsClient cronJobs={cronJobs || []} />
}

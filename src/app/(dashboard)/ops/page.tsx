import { supabase } from '@/lib/supabase'
import { OpsClient } from './ops-client'

export const dynamic = 'force-dynamic'

export default async function OpsPage() {
  const { data: cronJobs } = await supabase
    .from('cron_jobs')
    .select('*')
    .order('name')

  return <OpsClient cronJobs={cronJobs || []} />
}

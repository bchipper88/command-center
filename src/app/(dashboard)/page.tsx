import { supabase, Site, CronJob, ActivityLog, Task, CeoIdea } from '@/lib/supabase'
import { DashboardClient } from './dashboard-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getData() {
  const [
    { data: sites },
    { data: cronJobs },
    { data: activity },
    { data: tasks },
    { data: ideas },
  ] = await Promise.all([
    supabase.from('sites').select('*') as unknown as { data: Site[] | null },
    supabase.from('cron_jobs').select('*').order('updated_at', { ascending: false }).limit(10) as unknown as { data: CronJob[] | null },
    supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('tasks').select('*') as unknown as { data: Task[] | null },
    supabase.from('ceo_ideas').select('*').eq('status', 'proposed') as unknown as { data: CeoIdea[] | null },
  ])

  // Task stats
  const taskStats = {
    total: tasks?.length || 0,
    blocked: tasks?.filter(t => t.status === 'blocked').length || 0,
    inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    highPriority: tasks?.filter(t => t.priority === 'high' && t.status !== 'done').length || 0,
  }

  // Cron stats
  const failedCrons = cronJobs?.filter(c => c.last_status === 'error' || (c.consecutive_errors || 0) > 0).length || 0
  
  return {
    sites: sites || [],
    cronJobs: cronJobs || [],
    activity: (activity as ActivityLog[]) || [],
    taskStats,
    ideasCount: ideas?.length || 0,
    failedCrons,
  }
}

export default async function DashboardPage() {
  const data = await getData()
  return <DashboardClient data={data} />
}

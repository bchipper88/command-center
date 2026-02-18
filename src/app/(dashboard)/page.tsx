import { supabase, Site, Keyword, CronJob, ActivityLog, GscSnapshot } from '@/lib/supabase'
import { DashboardClient } from './dashboard-client'

export const dynamic = 'force-dynamic'

async function getData() {
  const [
    { data: sites },
    { data: businesses },
    { data: blogPosts },
    { data: keywords },
    { data: cronJobs },
    { data: activity },
    { data: gscSnapshots },
  ] = await Promise.all([
    supabase.from('sites').select('*') as unknown as { data: Site[] | null },
    supabase.from('businesses').select('id, site_id, category') as unknown as { data: { id: string; site_id: string; category: string }[] | null },
    supabase.from('blog_posts').select('id, site_id, status') as unknown as { data: { id: string; site_id: string; status: string }[] | null },
    supabase.from('keywords').select('id, site_id, gsc_clicks') as unknown as { data: Pick<Keyword, 'id' | 'site_id' | 'gsc_clicks'>[] | null },
    supabase.from('cron_jobs').select('*').order('updated_at', { ascending: false }).limit(20) as unknown as { data: CronJob[] | null },
    supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(20) as unknown as { data: ActivityLog[] | null },
    supabase.from('gsc_snapshots').select('*').order('date', { ascending: false }).limit(30) as unknown as { data: GscSnapshot[] | null },
  ])

  const totalBusinesses = businesses?.length || 0
  const totalBlogPosts = blogPosts?.length || 0
  const totalKeywords = keywords?.length || 0
  const totalClicks = keywords?.reduce((sum, k) => sum + (k.gsc_clicks || 0), 0) || 0

  return {
    kpis: { totalBusinesses, totalBlogPosts, totalKeywords, totalClicks },
    sites: sites || [],
    businesses: businesses || [],
    blogPosts: blogPosts || [],
    cronJobs: cronJobs || [],
    activity: activity || [],
    gscSnapshots: gscSnapshots || [],
  }
}

export default async function DashboardPage() {
  const data = await getData()
  return <DashboardClient data={data} />
}

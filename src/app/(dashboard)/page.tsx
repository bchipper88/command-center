import { supabase, Keyword } from '@/lib/supabase'
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
    supabase.from('sites').select('*'),
    supabase.from('businesses').select('id, site_id, category'),
    supabase.from('blog_posts').select('id, site_id, status'),
    supabase.from('keywords').select('id, site_id, gsc_clicks') as unknown as { data: Pick<Keyword, 'id' | 'site_id' | 'gsc_clicks'>[] | null },
    supabase.from('cron_jobs').select('*').order('updated_at', { ascending: false }).limit(20),
    supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('gsc_snapshots').select('*').order('date', { ascending: false }).limit(30),
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

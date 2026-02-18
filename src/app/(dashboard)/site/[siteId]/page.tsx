import { supabase, Site, Business, BlogPost, Keyword, ActivityLog } from '@/lib/supabase'
import { SiteOverviewClient } from './site-overview-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const validSites = ['lv', 'denver', 'savannah', 'jurassic']

export default async function SiteOverviewPage({ params }: { params: { siteId: string } }) {
  const { siteId } = params
  if (!validSites.includes(siteId)) notFound()

  const [
    { data: site },
    { data: businesses },
    { data: blogPosts },
    { data: keywords },
    { data: activity },
  ] = await Promise.all([
    supabase.from('sites').select('*').eq('id', siteId).single() as unknown as { data: Site | null },
    supabase.from('businesses').select('*').eq('site_id', siteId) as unknown as { data: Business[] | null },
    supabase.from('blog_posts').select('*').eq('site_id', siteId) as unknown as { data: BlogPost[] | null },
    supabase.from('keywords').select('*').eq('site_id', siteId) as unknown as { data: Keyword[] | null },
    supabase.from('activity_log').select('*').eq('site_id', siteId).order('created_at', { ascending: false }).limit(15) as unknown as { data: ActivityLog[] | null },
  ])

  return (
    <SiteOverviewClient
      siteId={siteId}
      site={site}
      businesses={businesses || []}
      blogPosts={blogPosts || []}
      keywords={keywords || []}
      activity={activity || []}
    />
  )
}

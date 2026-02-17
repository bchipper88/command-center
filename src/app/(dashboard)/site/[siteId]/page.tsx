import { supabase } from '@/lib/supabase'
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
    supabase.from('sites').select('*').eq('id', siteId).single(),
    supabase.from('businesses').select('*').eq('site_id', siteId),
    supabase.from('blog_posts').select('*').eq('site_id', siteId),
    supabase.from('keywords').select('*').eq('site_id', siteId),
    supabase.from('activity_log').select('*').eq('site_id', siteId).order('created_at', { ascending: false }).limit(15),
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

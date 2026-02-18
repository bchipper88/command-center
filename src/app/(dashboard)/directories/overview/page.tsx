import { supabase, Site, Business, BlogPost, Keyword, ActivityLog } from '@/lib/supabase'
import { DirectoriesOverviewClient } from './client'

export const dynamic = 'force-dynamic'

export default async function DirectoriesOverviewPage() {
  const siteIds = ['lv', 'denver', 'savannah']
  
  const [
    { data: sites },
    { data: businesses },
    { data: blogPosts },
    { data: keywords },
    { data: activity },
  ] = await Promise.all([
    supabase.from('sites').select('*').in('id', siteIds) as unknown as { data: Site[] | null },
    supabase.from('businesses').select('*').in('site_id', siteIds) as unknown as { data: Business[] | null },
    supabase.from('blog_posts').select('*').in('site_id', siteIds) as unknown as { data: BlogPost[] | null },
    supabase.from('keywords').select('*').in('site_id', siteIds) as unknown as { data: Keyword[] | null },
    supabase.from('activity_log').select('*').in('site_id', siteIds).order('created_at', { ascending: false }).limit(30) as unknown as { data: ActivityLog[] | null },
  ])

  return (
    <DirectoriesOverviewClient
      sites={sites || []}
      businesses={businesses || []}
      blogPosts={blogPosts || []}
      keywords={keywords || []}
      activity={activity || []}
    />
  )
}

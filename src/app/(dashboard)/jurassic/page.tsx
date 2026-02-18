import { supabase, Site, BlogPost, Keyword } from '@/lib/supabase'
import { JurassicOverviewClient } from './client'

export const dynamic = 'force-dynamic'

export default async function JurassicOverviewPage() {
  const [
    { data: site },
    { data: blogPosts },
    { data: keywords },
  ] = await Promise.all([
    supabase.from('sites').select('*').eq('id', 'jurassic').single() as unknown as { data: Site | null },
    supabase.from('blog_posts').select('*').eq('site_id', 'jurassic') as unknown as { data: BlogPost[] | null },
    supabase.from('keywords').select('*').eq('site_id', 'jurassic').order('volume', { ascending: false }) as unknown as { data: Keyword[] | null },
  ])

  return (
    <JurassicOverviewClient
      site={site}
      blogPosts={blogPosts || []}
      keywords={keywords || []}
    />
  )
}

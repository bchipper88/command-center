import { supabase, BlogPost, Site } from '@/lib/supabase'
import { ContentClient } from './content-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Never cache
export const fetchCache = 'force-no-store'

export default async function ContentPage() {
  const [
    { data: posts },
    { data: sites },
  ] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, site_id, slug, title, target_keyword, keyword_volume, keyword_difficulty, category, status, word_count, image_url, pr_url, published_at, created_at, updated_at, reviewed') as unknown as { data: BlogPost[] | null },
    supabase.from('sites').select('id, name, domain') as unknown as { data: Pick<Site, 'id' | 'name' | 'domain'>[] | null },
  ])

  return <ContentClient posts={posts || []} sites={sites || []} />
}

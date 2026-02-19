import { supabase, BlogPost, Site } from '@/lib/supabase'
import { ContentClient } from './content-client'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  const [
    { data: posts },
    { data: sites },
  ] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100) as unknown as { data: BlogPost[] | null },
    supabase.from('sites').select('id, name, domain') as unknown as { data: Pick<Site, 'id' | 'name' | 'domain'>[] | null },
  ])

  return <ContentClient posts={posts || []} sites={sites || []} />
}

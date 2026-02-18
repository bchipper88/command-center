import { supabase } from '@/lib/supabase'

type BlogPost = {
  id: string; slug: string; title: string; target_keyword: string | null;
  keyword_volume: number | null; keyword_difficulty: string | null;
  category: string | null; status: string; word_count: number | null;
  internal_link_count: number | null; pr_url: string | null;
  published_at: string | null; created_at: string
}
import { ContentClient } from './content-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ContentPage({ params }: { params: { siteId: string } }) {
  const { siteId } = params
  if (!['lv', 'denver', 'savannah', 'jurassic'].includes(siteId)) notFound()

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false }) as unknown as { data: BlogPost[] | null }

  return <ContentClient siteId={siteId} blogPosts={blogPosts || []} />
}

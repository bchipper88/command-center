import { supabase } from '@/lib/supabase'
import { DirectoriesContentClient } from './client'

export const dynamic = 'force-dynamic'

type BlogPost = {
  id: string; site_id: string; slug: string; title: string; target_keyword: string | null;
  keyword_volume: number | null; keyword_difficulty: string | null;
  category: string | null; status: string; word_count: number | null;
  pr_url: string | null; published_at: string | null; created_at: string
}

export default async function DirectoriesContentPage() {
  const siteIds = ['lv', 'denver', 'savannah']
  
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .in('site_id', siteIds)
    .order('created_at', { ascending: false }) as unknown as { data: BlogPost[] | null }

  return <DirectoriesContentClient blogPosts={blogPosts || []} />
}

import { supabase } from '@/lib/supabase'
import { JurassicContentClient } from './client'

export const dynamic = 'force-dynamic'

type BlogPost = {
  id: string; slug: string; title: string; target_keyword: string | null;
  keyword_volume: number | null; keyword_difficulty: string | null;
  status: string; word_count: number | null; published_at: string | null; created_at: string
}

export default async function JurassicContentPage() {
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('site_id', 'jurassic')
    .order('created_at', { ascending: false }) as unknown as { data: BlogPost[] | null }

  return <JurassicContentClient blogPosts={blogPosts || []} />
}

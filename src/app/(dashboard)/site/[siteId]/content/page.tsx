import { supabase } from '@/lib/supabase'
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
    .order('created_at', { ascending: false })

  return <ContentClient siteId={siteId} blogPosts={blogPosts || []} />
}

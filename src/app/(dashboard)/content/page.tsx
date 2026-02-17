import { supabase } from '@/lib/supabase'
import { ContentClient } from './content-client'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: sites } = await supabase.from('sites').select('id, name')

  return <ContentClient posts={posts || []} sites={sites || []} />
}

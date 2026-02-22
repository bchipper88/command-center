import { supabase, BlogPost, Site } from '@/lib/supabase'
import { ContentClient } from './content-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Never cache
export const fetchCache = 'force-no-store'

export type TaskStatus = {
  total: number
  done: number
  lastUpdated: string | null
}

export default async function ContentPage() {
  const [
    { data: posts },
    { data: sites },
    { data: taskRows },
  ] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, site_id, slug, title, target_keyword, keyword_volume, keyword_difficulty, category, status, word_count, image_url, pr_url, published_at, created_at, updated_at, reviewed') as unknown as { data: BlogPost[] | null },
    supabase.from('sites').select('id, name, domain') as unknown as { data: Pick<Site, 'id' | 'name' | 'domain'>[] | null },
    supabase.from('tasks').select('post_id, status, updated_at').not('post_id', 'is', null) as unknown as { data: { post_id: string; status: string; updated_at: string }[] | null },
  ])

  // Build task status map with completion tracking
  const taskStatus: Record<string, TaskStatus> = {}
  for (const row of taskRows || []) {
    if (!taskStatus[row.post_id]) {
      taskStatus[row.post_id] = { total: 0, done: 0, lastUpdated: null }
    }
    taskStatus[row.post_id].total += 1
    if (row.status === 'done') {
      taskStatus[row.post_id].done += 1
    }
    // Track most recent update
    const current = taskStatus[row.post_id].lastUpdated
    if (!current || row.updated_at > current) {
      taskStatus[row.post_id].lastUpdated = row.updated_at
    }
  }

  return <ContentClient posts={posts || []} sites={sites || []} taskStatus={taskStatus} />
}

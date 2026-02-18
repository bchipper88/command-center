import { createClient } from '@supabase/supabase-js'

// Lazy singleton - only created when first accessed at runtime
let _client: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }
    _client = createClient(url, key)
  }
  return _client
}

// Export object with getter that lazily initializes
export const supabase = {
  from: (...args: Parameters<ReturnType<typeof createClient>['from']>) => getClient().from(...args),
  auth: new Proxy({} as ReturnType<typeof createClient>['auth'], {
    get: (_, prop) => (getClient().auth as unknown as Record<string, unknown>)[prop as string]
  }),
  storage: new Proxy({} as ReturnType<typeof createClient>['storage'], {
    get: (_, prop) => (getClient().storage as unknown as Record<string, unknown>)[prop as string]
  }),
  rpc: (...args: Parameters<ReturnType<typeof createClient>['rpc']>) => getClient().rpc(...args),
}

export type Site = {
  id: string
  name: string
  domain: string | null
  github_repo: string | null
  total_businesses: number
  total_blog_posts: number
  updated_at: string
}

export type Business = {
  id: string
  site_id: string
  slug: string
  name: string
  category: string
  subcategory: string | null
  city: string | null
  address: string | null
  phone: string | null
  website: string | null
  description: string | null
  google_rating: number | null
  google_review_count: number | null
  featured: boolean
  score: number | null
  added_at: string
}

export type BlogPost = {
  id: string
  site_id: string
  slug: string
  title: string
  target_keyword: string | null
  keyword_volume: number | null
  keyword_difficulty: string | null
  category: string | null
  status: string
  word_count: number | null
  image_url: string | null
  pr_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Keyword = {
  id: string
  site_id: string
  keyword: string
  volume: number | null
  cpc: number | null
  difficulty: string | null
  category: string | null
  cluster_type: string | null
  pillar_keyword: string | null
  blog_post_id: string | null
  gsc_position: number | null
  gsc_impressions: number | null
  gsc_clicks: number | null
  gsc_ctr: number | null
  last_ranked_at: string | null
  created_at: string
  updated_at: string
}

export type CronJob = {
  id: string
  name: string
  description: string | null
  schedule: string | null
  enabled: boolean
  last_run_at: string | null
  next_run_at: string | null
  last_status: string | null
  last_duration_ms: number | null
  consecutive_errors: number
  payload_preview: string | null
  updated_at: string
}

export type ActivityLog = {
  id: string
  site_id: string | null
  event_type: string
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type SourceFile = {
  path: string
  content: string | null
  category: string | null
  updated_at: string
}

export type GscSnapshot = {
  id: string
  site_id: string
  date: string
  total_clicks: number | null
  total_impressions: number | null
  avg_position: number | null
  avg_ctr: number | null
  created_at: string
}

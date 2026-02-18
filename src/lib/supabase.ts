// Direct REST API approach - bypasses client initialization issues
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

type QueryBuilder = {
  select: (columns: string) => QueryBuilder
  eq: (column: string, value: string) => QueryBuilder
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder
  limit: (count: number) => QueryBuilder
  single: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }>
  then: <T>(resolve: (result: { data: T[] | null; error: Error | null }) => void) => Promise<void>
}

function createQueryBuilder(table: string): QueryBuilder {
  let url = `${SUPABASE_URL}/rest/v1/${table}`
  const params = new URLSearchParams()
  let selectCols = '*'
  let isSingle = false

  const builder: QueryBuilder = {
    select(columns: string) {
      selectCols = columns
      params.set('select', columns)
      return builder
    },
    eq(column: string, value: string) {
      params.set(column, `eq.${value}`)
      return builder
    },
    order(column: string, options?: { ascending?: boolean }) {
      const dir = options?.ascending === false ? 'desc' : 'asc'
      params.set('order', `${column}.${dir}`)
      return builder
    },
    limit(count: number) {
      params.set('limit', String(count))
      return builder
    },
    single() {
      isSingle = true
      params.set('limit', '1')
      return builder.then((res) => ({
        data: res.data?.[0] || null,
        error: res.error
      })) as Promise<{ data: Record<string, unknown> | null; error: Error | null }>
    },
    async then<T>(resolve: (result: { data: T[] | null; error: Error | null }) => void) {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        resolve({ data: [] as T[], error: null })
        return
      }
      try {
        const queryUrl = `${url}?${params.toString()}`
        console.log('[Supabase] Fetching:', queryUrl)
        const res = await fetch(queryUrl, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          cache: 'no-store',
        })
        if (!res.ok) {
          const text = await res.text()
          console.error('[Supabase] Error:', res.status, text)
          resolve({ data: null, error: new Error(`${res.status}: ${text}`) })
          return
        }
        const data = await res.json()
        console.log('[Supabase] Got', data.length, 'rows for', table)
        resolve({ data, error: null })
      } catch (err) {
        console.error('[Supabase] Fetch error:', err)
        resolve({ data: null, error: err as Error })
      }
    }
  }
  return builder
}

export const supabase = {
  from: (table: string) => createQueryBuilder(table),
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

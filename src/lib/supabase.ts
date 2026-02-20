import { createClient } from '@supabase/supabase-js'

// Hardcoded for reliability - Command Center Supabase
const supabaseUrl = 'https://heetkfaggxclbwfrmhln.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZXRrZmFnZ3hjbGJ3ZnJtaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjIzNjQsImV4cCI6MjA4NjkzODM2NH0.j1LnNkyIbzLilRIePf4qD90lcKhksdQNnkF81IIcQxc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  reviewed: boolean
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

export type CeoReview = {
  id: string
  site_id: string
  agent_id: string | null
  agent_name: string
  review_date: string
  summary: string
  wins: string[]
  challenges: string[]
  metrics: string | null
  ideas: string | null
  status: string
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'blocked' | 'done'
  assigned_to: string
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
  completed_at: string | null
}

export type CeoIdea = {
  id: string
  site_id: string | null
  agent_name: string
  title: string
  description: string | null
  category: string | null
  priority: 'low' | 'medium' | 'high' | null
  effort: 'low' | 'medium' | 'high' | null
  impact_score: number | null
  effort_score: number | null
  status: 'proposed' | 'approved' | 'rejected' | 'implemented'
  john_rating: number | null
  john_feedback: string | null
  created_at: string
  updated_at: string
}

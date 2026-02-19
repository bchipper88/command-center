import { supabase } from '@/lib/supabase'
import { ReviewsClient } from './client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export type CeoIdea = {
  id: string
  site_id: string
  agent_name: string
  title: string
  description: string | null
  category: string | null
  priority: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  created_at: string
  updated_at: string
  completed_at: string | null
}

export type CeoReview = {
  id: string
  site_id: string
  agent_name: string
  review_date: string
  summary: string
  wins: string[]
  challenges: string[]
  metrics: string | null
  status: string
  created_at: string
}

async function getData() {
  const [{ data: ideas }, { data: reviews }] = await Promise.all([
    supabase
      .from('ceo_ideas')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('ceo_reviews')
      .select('*')
      .order('review_date', { ascending: false })
  ])

  return { 
    ideas: (ideas || []) as CeoIdea[],
    reviews: (reviews || []) as CeoReview[]
  }
}

export default async function ReviewsPage() {
  const data = await getData()
  return <ReviewsClient ideas={data.ideas} reviews={data.reviews} />
}

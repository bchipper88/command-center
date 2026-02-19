import { supabase } from '@/lib/supabase'
import { ChristmasOverviewClient } from './christmas-client'

export const dynamic = 'force-dynamic'

type PageGrade = {
  path: string
  title: string
  overall_score: number
  seo_score: number
  content_quality_score: number
  content_length_score: number
  pseo_score: number
  formatting_score: number
  completeness_score: number
  word_count: number
  has_images: number
  images_needed: boolean
  image_priority: string | null
  notes: string | null
}

export default async function ChristmasOverviewPage() {
  const { data: grades } = await supabase
    .from('page_grades')
    .select('*')
    .eq('site_id', 'christmas')
    .order('overall_score', { ascending: false }) as { data: PageGrade[] | null }

  return <ChristmasOverviewClient grades={grades || []} />
}

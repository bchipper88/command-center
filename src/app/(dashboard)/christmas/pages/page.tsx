import { supabase } from '@/lib/supabase'
import { PagesClient } from './pages-client'

export const dynamic = 'force-dynamic'

type PageGrade = {
  path: string
  url: string
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

export default async function ChristmasPagesPage() {
  const { data: grades } = await supabase
    .from('page_grades')
    .select('*')
    .eq('site_id', 'christmas')
    .order('overall_score', { ascending: false }) as { data: PageGrade[] | null }

  return <PagesClient grades={grades || []} />
}

import { supabase, Keyword, GscSnapshot } from '@/lib/supabase'
import { SEOClient } from './seo-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SEOPage({ params }: { params: { siteId: string } }) {
  const { siteId } = params
  console.log('[SEO Page] Loading for site:', siteId)
  
  if (!['lv', 'denver', 'savannah', 'jurassic'].includes(siteId)) notFound()

  const [keywordsResult, gscResult] = await Promise.all([
    supabase.from('keywords').select('*').eq('site_id', siteId).order('volume', { ascending: false }),
    supabase.from('gsc_snapshots').select('*').eq('site_id', siteId).order('date', { ascending: true }).limit(90),
  ])
  
  const keywords = (keywordsResult.data || []) as Keyword[]
  const gscSnapshots = (gscResult.data || []) as GscSnapshot[]
  
  console.log('[SEO Page] Site:', siteId, '| Keywords:', keywords.length, '| Error:', keywordsResult.error)

  return <SEOClient siteId={siteId} keywords={keywords} gscSnapshots={gscSnapshots} />
}

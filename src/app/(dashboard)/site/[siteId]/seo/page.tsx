import { supabase } from '@/lib/supabase'
import { SEOClient } from './seo-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SEOPage({ params }: { params: { siteId: string } }) {
  const { siteId } = params
  if (!['lv', 'denver', 'savannah', 'jurassic'].includes(siteId)) notFound()

  const [
    { data: keywords },
    { data: gscSnapshots },
  ] = await Promise.all([
    supabase.from('keywords').select('*').eq('site_id', siteId).order('volume', { ascending: false }),
    supabase.from('gsc_snapshots').select('*').eq('site_id', siteId).order('date', { ascending: true }).limit(90),
  ])

  return <SEOClient siteId={siteId} keywords={keywords || []} gscSnapshots={gscSnapshots || []} />
}

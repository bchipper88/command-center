import { supabase } from '@/lib/supabase'
import { SeoClient } from './seo-client'

export const dynamic = 'force-dynamic'

export default async function SeoPage() {
  const [
    { data: keywords },
    { data: sites },
    { data: gscSnapshots }
  ] = await Promise.all([
    supabase.from('keywords').select('*').not('gsc_position', 'is', null).order('gsc_impressions', { ascending: false }).limit(1000),
    supabase.from('sites').select('id, name'),
    supabase.from('gsc_snapshots').select('*').order('date', { ascending: true })
  ])

  return (
    <SeoClient 
      keywords={keywords || []} 
      sites={sites || []} 
      gscSnapshots={gscSnapshots || []} 
    />
  )
}

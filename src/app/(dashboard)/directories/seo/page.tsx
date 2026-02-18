import { supabase, Keyword } from '@/lib/supabase'
import { DirectoriesSEOClient } from './client'

export const dynamic = 'force-dynamic'

export default async function DirectoriesSEOPage() {
  const siteIds = ['lv', 'denver', 'savannah']
  
  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .in('site_id', siteIds)
    .order('volume', { ascending: false }) as unknown as { data: Keyword[] | null }

  return <DirectoriesSEOClient keywords={keywords || []} />
}

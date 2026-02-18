import { supabase, Keyword } from '@/lib/supabase'
import { JurassicSEOClient } from './client'

export const dynamic = 'force-dynamic'

export default async function JurassicSEOPage() {
  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .eq('site_id', 'jurassic')
    .order('volume', { ascending: false }) as unknown as { data: Keyword[] | null }

  return <JurassicSEOClient keywords={keywords || []} />
}

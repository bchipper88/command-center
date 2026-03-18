import { supabase } from '@/lib/supabase'
import { OpportunitiesClient } from './opportunities-client'

export const dynamic = 'force-dynamic'

export default async function OpportunitiesPage() {
  const { data: opportunities } = await supabase
    .from('ideas')
    .select('*')
    .order('total_score', { ascending: false })

  return <OpportunitiesClient opportunities={opportunities || []} />
}

import { supabase } from '@/lib/supabase'
import { OpportunitiesClient } from './opportunities-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OpportunitiesPage() {
  const { data: opportunities } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false })

  return <OpportunitiesClient opportunities={opportunities || []} />
}

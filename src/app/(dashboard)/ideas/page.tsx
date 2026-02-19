import { supabase } from '@/lib/supabase'
import { IdeasClient } from './ideas-client'

export const dynamic = 'force-dynamic'

export default async function IdeasPage() {
  // Fetch ideas from ceo_ideas table
  const { data: ideas } = await supabase
    .from('ceo_ideas')
    .select('*')
    .order('created_at', { ascending: false })

  return <IdeasClient ideas={ideas || []} />
}

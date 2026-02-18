import { supabase, Business } from '@/lib/supabase'
import { DirectoriesBusinessesClient } from './client'

export const dynamic = 'force-dynamic'

export default async function DirectoriesBusinessesPage() {
  const siteIds = ['lv', 'denver', 'savannah']
  
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .in('site_id', siteIds)
    .order('score', { ascending: false }) as unknown as { data: Business[] | null }

  return <DirectoriesBusinessesClient businesses={businesses || []} />
}

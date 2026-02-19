import { supabase, Business, Site } from '@/lib/supabase'
import { DirectoriesBusinessesClient } from './client'

export const dynamic = 'force-dynamic'

export default async function DirectoriesBusinessesPage() {
  const siteIds = ['lv', 'denver', 'savannah']
  
  const [{ data: businesses }, { data: sites }] = await Promise.all([
    supabase
      .from('businesses')
      .select('*')
      .in('site_id', siteIds)
      .order('score', { ascending: false }) as unknown as { data: Business[] | null },
    supabase
      .from('sites')
      .select('id, name, domain')
      .in('id', siteIds) as unknown as { data: Pick<Site, 'id' | 'name' | 'domain'>[] | null },
  ])

  return <DirectoriesBusinessesClient businesses={businesses || []} sites={sites || []} />
}

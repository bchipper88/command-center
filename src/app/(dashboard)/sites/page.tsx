import { supabase } from '@/lib/supabase'
import { SitesClient } from './sites-client'

export const dynamic = 'force-dynamic'

export default async function SitesPage() {
  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .order('name')

  return <SitesClient sites={sites || []} />
}
